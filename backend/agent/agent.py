"""
Main agent orchestrator: multi-turn conversation with Anthropic tool use.
"""
import json
import logging
from typing import Any, AsyncGenerator, Optional

import anthropic

from config import settings
from database import SessionLocal
from models import ChatMessage, ChatSession
from agent.tools import TOOL_SCHEMAS, execute_tool
from agent.prompts import SYSTEM_PROMPT_EN

logger = logging.getLogger(__name__)

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


# ---------------------------------------------------------------------------
# Session helpers
# ---------------------------------------------------------------------------

def _get_or_create_session(db, session_id: str, language: str = "en") -> ChatSession:
    session = db.query(ChatSession).filter(ChatSession.session_id == session_id).first()
    if not session:
        session = ChatSession(session_id=session_id, language=language)
        db.add(session)
        db.commit()
        db.refresh(session)
    return session


def _load_history(db, session_id: str) -> list[dict]:
    """Load conversation history, excluding internal tool messages."""
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.session_id == session_id,
            ChatMessage.role.in_(["user", "assistant"]),
        )
        .order_by(ChatMessage.id.asc())
        .all()
    )
    history = []
    for msg in messages:
        if msg.content:
            history.append({"role": msg.role, "content": msg.content})
    return history


def _save_message(db, session_id: str, role: str, content: str, tool_name: str = None):
    msg = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        tool_name=tool_name,
    )
    db.add(msg)
    db.commit()


def _extract_quick_replies(text: str) -> list[str]:
    """Simple heuristic: pick up to 4 bullet/numbered items at end of message."""
    lines = text.strip().split("\n")
    quick = []
    for line in reversed(lines):
        stripped = line.strip().lstrip("•-*123456789. ").strip()
        if stripped and len(stripped) < 80 and len(quick) < 4:
            quick.insert(0, stripped)
        elif quick:
            break
    return quick[:4] if len(quick) >= 2 else []


# ---------------------------------------------------------------------------
# Core agent loop
# ---------------------------------------------------------------------------

async def process_chat(
    session_id: str,
    message: str,
    language: str = "en",
) -> dict:
    """
    Process one user message through the agent.
    Returns: {message, quick_replies, actions_taken}
    """
    db = SessionLocal()
    try:
        _get_or_create_session(db, session_id, language)
        history = _load_history(db, session_id)

        # Save user message
        _save_message(db, session_id, "user", message)

        # Build messages list for Anthropic
        messages = history + [{"role": "user", "content": message}]

        actions_taken = []
        final_text = ""

        # Agentic loop — keep calling until we get a text stop
        max_iterations = 10
        for iteration in range(max_iterations):
            response = client.messages.create(
                model=settings.claude_model,
                max_tokens=2048,
                system=SYSTEM_PROMPT_EN,
                tools=TOOL_SCHEMAS,
                messages=messages,
            )

            # Check stop reason
            stop_reason = response.stop_reason

            # Process content blocks
            tool_uses = []
            text_blocks = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_uses.append(block)
                elif block.type == "text":
                    text_blocks.append(block.text)

            if text_blocks:
                final_text = "\n".join(text_blocks)

            if stop_reason == "tool_use" and tool_uses:
                # Append assistant's response (with tool calls) to messages
                messages.append({
                    "role": "assistant",
                    "content": response.content,
                })

                # Execute each tool and collect results
                tool_results = []
                for tool_use in tool_uses:
                    tool_name = tool_use.name
                    tool_input = tool_use.input

                    result = execute_tool(db, tool_name, tool_input)
                    actions_taken.append({"tool": tool_name, "result": result})

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps(result),
                    })

                # Append tool results to messages
                messages.append({
                    "role": "user",
                    "content": tool_results,
                })
                # Continue loop

            else:
                # No more tool calls — we have our final response
                break

        # Save assistant message
        if final_text:
            _save_message(db, session_id, "assistant", final_text)
        else:
            final_text = "I'm here to help. How can I assist you today?"
            _save_message(db, session_id, "assistant", final_text)

        quick_replies = _extract_quick_replies(final_text)

        return {
            "message": final_text,
            "quick_replies": quick_replies,
            "actions_taken": actions_taken,
        }

    except anthropic.APIError as e:
        logger.error(f"Anthropic API error: {e}")
        fallback = "I'm temporarily unavailable. Please try again in a moment."
        _save_message(db, session_id, "assistant", fallback)
        return {"message": fallback, "quick_replies": [], "actions_taken": []}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Streaming variant (for WebSocket)
# ---------------------------------------------------------------------------

async def process_chat_stream(
    session_id: str,
    message: str,
    language: str = "en",
) -> AsyncGenerator[dict, None]:
    """
    Stream tokens from the agent response via generator.
    Yields dicts: {"token": str} or {"done": True, "quick_replies": [...], "actions_taken": [...]}
    """
    db = SessionLocal()
    try:
        _get_or_create_session(db, session_id, language)
        history = _load_history(db, session_id)
        _save_message(db, session_id, "user", message)

        messages = history + [{"role": "user", "content": message}]
        actions_taken = []
        collected_text = ""

        # Run the tool loop first (non-streaming) until we get final text
        # Then stream the final text token by token for demo purposes.
        # A true streaming implementation would use client.messages.stream().
        max_iterations = 10
        for iteration in range(max_iterations):
            response = client.messages.create(
                model=settings.claude_model,
                max_tokens=2048,
                system=SYSTEM_PROMPT_EN,
                tools=TOOL_SCHEMAS,
                messages=messages,
            )

            stop_reason = response.stop_reason
            tool_uses = []
            text_parts = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_uses.append(block)
                elif block.type == "text":
                    text_parts.append(block.text)

            if text_parts:
                collected_text = "\n".join(text_parts)

            if stop_reason == "tool_use" and tool_uses:
                messages.append({"role": "assistant", "content": response.content})
                tool_results = []
                for tool_use in tool_uses:
                    result = execute_tool(db, tool_use.name, tool_use.input)
                    actions_taken.append({"tool": tool_use.name, "result": result})
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps(result),
                    })
                messages.append({"role": "user", "content": tool_results})
            else:
                break

        final_text = collected_text or "I'm here to help. How can I assist you today?"
        _save_message(db, session_id, "assistant", final_text)

        # Stream the text word by word
        words = final_text.split(" ")
        for i, word in enumerate(words):
            token = word if i == 0 else " " + word
            yield {"token": token}

        quick_replies = _extract_quick_replies(final_text)
        yield {"done": True, "quick_replies": quick_replies, "actions_taken": actions_taken}

    except Exception as e:
        logger.exception(f"Streaming error: {e}")
        yield {"token": "I'm temporarily unavailable. Please try again."}
        yield {"done": True, "quick_replies": [], "actions_taken": []}
    finally:
        db.close()
