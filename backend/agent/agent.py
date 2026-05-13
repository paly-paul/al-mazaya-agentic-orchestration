"""
Main agent orchestrator.
Calls Claude claude-sonnet-4-6 with tool-use and maintains full per-session conversation history.
"""
import json
from typing import AsyncGenerator, Optional

import anthropic
from sqlalchemy.orm import Session as DBSession

from agent.prompts import get_system_prompt
from agent.tools import ALL_TOOLS, execute_tool
from config import settings
from models.message import Message
from models.session import Session as SessionModel


_client: Optional[anthropic.Anthropic] = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


def _load_history(db: DBSession, session_id: str) -> list[dict]:
    """Load conversation history for a session, excluding internal tool messages."""
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id, Message.role.in_(["user", "assistant"]))
        .order_by(Message.created_at.asc())
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in messages]


def _save_message(db: DBSession, session_id: str, role: str, content: str, language: str = "en") -> None:
    msg = Message(session_id=session_id, role=role, content=content, language=language)
    db.add(msg)
    db.commit()


def _upsert_session(db: DBSession, session_id: str, language: str, use_case_hint: Optional[str]) -> None:
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session:
        session = SessionModel(
            id=session_id,
            user_type="prospect",
            language=language,
            use_case=use_case_hint,
        )
        db.add(session)
    else:
        session.language = language
        if use_case_hint:
            session.use_case = use_case_hint
    db.commit()


def _extract_quick_replies(text: str) -> tuple[str, list[str]]:
    """Pull 'Quick replies:' block out of response text and return (clean_text, replies)."""
    if "Quick replies:" not in text and "ردود سريعة:" not in text:
        return text, []

    replies = []
    lines = text.split("\n")
    filtered = []
    in_qr = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("Quick replies:") or stripped.startswith("ردود سريعة:"):
            in_qr = True
            continue
        if in_qr:
            if stripped.startswith(("-", "•", "*")) or (len(stripped) > 1 and stripped[0].isdigit() and stripped[1] in (".", ")")):
                clean = stripped.lstrip("-•*0123456789.) ").strip()
                if clean:
                    replies.append(clean)
                continue
            else:
                in_qr = False
        filtered.append(line)

    clean_text = "\n".join(filtered).strip()
    return clean_text, replies


def run_agent(
    db: DBSession,
    session_id: str,
    user_message: str,
    language: str = "en",
    use_case_hint: Optional[str] = None,
) -> dict:
    """
    Synchronous agent turn. Returns:
    {
        "message": str,
        "quick_replies": list,
        "structured_output": dict | None,
        "actions_taken": list,
    }
    """
    _upsert_session(db, session_id, language, use_case_hint)
    _save_message(db, session_id, "user", user_message, language)

    history = _load_history(db, session_id)
    # Build messages list from history; last message is the current user turn
    messages = history  # already includes the message we just saved

    system_prompt = get_system_prompt(language)
    client = _get_client()
    actions_taken = []

    # Agentic loop — continue until Claude produces a final text response
    while True:
        response = client.messages.create(
            model=settings.claude_model,
            max_tokens=2048,
            system=system_prompt,
            tools=ALL_TOOLS,
            messages=messages,
        )

        # Check stop reason
        if response.stop_reason == "tool_use":
            # Process all tool use blocks in this response
            assistant_content = []
            tool_results = []

            for block in response.content:
                assistant_content.append(block.model_dump() if hasattr(block, "model_dump") else block)

                if block.type == "tool_use":
                    tool_result = execute_tool(block.name, block.input, db)
                    actions_taken.append({"tool": block.name, "result": tool_result})
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(tool_result),
                    })

            # Append assistant message with tool_use blocks
            messages.append({"role": "assistant", "content": assistant_content})
            # Append tool results as user turn
            messages.append({"role": "user", "content": tool_results})

        else:
            # Final text response
            final_text = ""
            for block in response.content:
                if hasattr(block, "text"):
                    final_text += block.text

            clean_text, quick_replies = _extract_quick_replies(final_text)

            _save_message(db, session_id, "assistant", clean_text, language)

            # Detect structured output from actions
            structured_output = None
            for action in actions_taken:
                tool = action["tool"]
                result = action["result"]
                if tool == "score_lead":
                    structured_output = {
                        "type": "lead_score",
                        "payload": result,
                    }
                    break
                elif tool == "get_quote":
                    structured_output = {
                        "type": "quote",
                        "payload": result,
                    }
                    break
                elif tool == "create_ticket":
                    structured_output = {
                        "type": "ticket_ref",
                        "payload": result,
                    }
                    break
                elif tool == "register_vendor":
                    structured_output = {
                        "type": "vendor_ref",
                        "payload": result,
                    }
                    break

            return {
                "message": clean_text,
                "quick_replies": quick_replies,
                "structured_output": structured_output,
                "actions_taken": actions_taken,
            }


async def run_agent_streaming(
    db: DBSession,
    session_id: str,
    user_message: str,
    language: str = "en",
    use_case_hint: Optional[str] = None,
) -> AsyncGenerator[dict, None]:
    """
    Async streaming agent turn.
    Yields token dicts: {"token": "..."} and finally {"done": True, ...}
    Tool calls are handled synchronously mid-stream; only the final text is streamed.
    """
    _upsert_session(db, session_id, language, use_case_hint)
    _save_message(db, session_id, "user", user_message, language)

    history = _load_history(db, session_id)
    messages = list(history)
    system_prompt = get_system_prompt(language)
    client = _get_client()
    actions_taken = []

    # Handle tool calls synchronously first, then stream only the final response
    while True:
        # Non-streaming check to handle tool use
        probe = client.messages.create(
            model=settings.claude_model,
            max_tokens=2048,
            system=system_prompt,
            tools=ALL_TOOLS,
            messages=messages,
        )

        if probe.stop_reason == "tool_use":
            assistant_content = []
            tool_results = []

            for block in probe.content:
                assistant_content.append(block.model_dump() if hasattr(block, "model_dump") else block)
                if block.type == "tool_use":
                    tool_result = execute_tool(block.name, block.input, db)
                    actions_taken.append({"tool": block.name, "result": tool_result})
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": json.dumps(tool_result),
                    })

            messages.append({"role": "assistant", "content": assistant_content})
            messages.append({"role": "user", "content": tool_results})

        else:
            # Stream the final text response
            full_text = ""
            with client.messages.stream(
                model=settings.claude_model,
                max_tokens=2048,
                system=system_prompt,
                tools=ALL_TOOLS,
                messages=messages,
            ) as stream:
                for text_chunk in stream.text_stream:
                    full_text += text_chunk
                    yield {"token": text_chunk}

            clean_text, quick_replies = _extract_quick_replies(full_text)
            _save_message(db, session_id, "assistant", clean_text, language)

            structured_output = None
            for action in actions_taken:
                tool = action["tool"]
                result = action["result"]
                if tool == "score_lead":
                    structured_output = {"type": "lead_score", "payload": result}
                    break
                elif tool == "get_quote":
                    structured_output = {"type": "quote", "payload": result}
                    break
                elif tool == "create_ticket":
                    structured_output = {"type": "ticket_ref", "payload": result}
                    break
                elif tool == "register_vendor":
                    structured_output = {"type": "vendor_ref", "payload": result}
                    break

            yield {
                "done": True,
                "quick_replies": quick_replies,
                "actions_taken": actions_taken,
                "structured_output": structured_output,
            }
            return
