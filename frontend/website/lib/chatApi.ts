export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  quickReplies?: string[];
  structuredOutput?: StructuredOutput | null;
}

export interface StructuredOutput {
  type: "lead_score" | "quote" | "ticket_ref" | "vendor_ref" | null;
  payload: Record<string, unknown>;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  language: "en" | "ar";
  use_case_hint?: "enquiry" | "maintenance" | "facility" | "vendor" | "management" | null;
}

export interface ChatResponse {
  success: boolean;
  data: {
    session_id: string;
    message: string;
    quick_replies: string[];
    structured_output: StructuredOutput | null;
    actions_taken: Array<{ tool: string; result: Record<string, unknown> }>;
  };
  error?: string;
}

const API_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function sendMessage(req: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  return res.json();
}

export function createWebSocketUrl(sessionId: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
    .replace(/^http/, "ws")
    .replace(/^https/, "wss");
  return `${base}/ws/chat/${sessionId}`;
}

export interface WsToken {
  token?: string;
  done?: boolean;
  quick_replies?: string[];
  structured_output?: StructuredOutput | null;
  actions_taken?: Array<{ tool: string; result: Record<string, unknown> }>;
  error?: string;
}

export function connectWebSocket(
  sessionId: string,
  onToken: (token: string) => void,
  onDone: (data: {
    quickReplies: string[];
    structuredOutput: StructuredOutput | null;
    actionsTaken: Array<{ tool: string; result: Record<string, unknown> }>;
  }) => void,
  onError: (err: string) => void
): WebSocket {
  const ws = new WebSocket(createWebSocketUrl(sessionId));

  ws.onmessage = (event: MessageEvent) => {
    try {
      const data: WsToken = JSON.parse(event.data);
      if (data.error) {
        onError(data.error);
        return;
      }
      if (data.token) {
        onToken(data.token);
      }
      if (data.done) {
        onDone({
          quickReplies: data.quick_replies ?? [],
          structuredOutput: data.structured_output ?? null,
          actionsTaken: data.actions_taken ?? [],
        });
        ws.close();
      }
    } catch {
      onError("Failed to parse server message");
    }
  };

  ws.onerror = () => {
    onError("WebSocket connection error");
  };

  return ws;
}
