import { getDatabase, generateId } from "../database/connection";
import type { ChatMessage, ChatRole } from "../types";
import { FREE_LIMITS } from "../types";
import { ContextGatherer } from "./ContextGatherer";

const SUPABASE_URL = "https://uquivmtkmzyvpkrnsccu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdWl2bXRrbXp5dnBrcm5zY2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjQ5MjksImV4cCI6MjA5NDk0MDkyOX0.Wrq4RaEdFJ4u46gKwakpterI-WWo8QPAC6AmhNmU1Go";

type Row = Record<string, unknown>;

function toModel(row: Row): ChatMessage {
  return {
    id: row.id as string,
    role: row.role as ChatRole,
    content: row.content as string,
    contextJson: row.context_json ? JSON.parse(row.context_json as string) : undefined,
    createdAt: row.created_at as string,
  };
}

export class AIServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "API_ERROR" | "NO_KEY") {
    super(message);
  }
}

const SYSTEM_PROMPT = `You are MakerOS Assistant — a knowledgeable, friendly AI helper for makers and craftspeople. You specialize in woodworking, laser cutting/engraving, CNC machining, 3D printing, resin art, knife making, leatherworking, candle making, and soap making.

You help with:
- Material selection and recommendations
- Calculator guidance (feeds & speeds, board feet, resin ratios, etc.)
- Troubleshooting common issues
- Project planning and workflow advice
- Safety best practices
- Business tips for maker shops (pricing, quoting, inventory)

Keep responses concise and practical. Use bullet points for steps. Include safety warnings when relevant. If the user provides shop context (projects, inventory, etc.), reference it naturally in your answers.`;

export const AIService = {
  getMessages(): ChatMessage[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM chat_messages ORDER BY created_at ASC",
    ) as Row[];
    return rows.map(toModel);
  },

  getRecentMessages(limit: number = 20): ChatMessage[] {
    const db = getDatabase();
    const rows = db.getAllSync(
      "SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT ?",
      [limit],
    ) as Row[];
    return rows.map(toModel).reverse();
  },

  getTodayMessageCount(): number {
    const db = getDatabase();
    const today = new Date().toISOString().split("T")[0];
    const row = db.getFirstSync(
      "SELECT COUNT(*) as cnt FROM chat_messages WHERE role = 'user' AND created_at >= ?",
      [today],
    ) as { cnt: number };
    return row?.cnt ?? 0;
  },

  saveMessage(role: ChatRole, content: string, contextJson?: Record<string, unknown>): ChatMessage {
    const db = getDatabase();
    const id = generateId();
    db.runSync(
      "INSERT INTO chat_messages (id, role, content, context_json) VALUES (?, ?, ?, ?)",
      [id, role, content, contextJson ? JSON.stringify(contextJson) : null],
    );
    const row = db.getFirstSync("SELECT * FROM chat_messages WHERE id = ?", [id]) as Row;
    return toModel(row);
  },

  clearHistory(): void {
    const db = getDatabase();
    db.runSync("DELETE FROM chat_messages");
  },

  async sendMessage(
    userMessage: string,
    _apiKey: string,
    isPro: boolean,
    onChunk?: (text: string) => void,
  ): Promise<string> {
    if (!isPro) {
      const todayCount = this.getTodayMessageCount();
      if (todayCount >= FREE_LIMITS.aiMessagesPerDay) {
        throw new AIServiceError(
          `Free tier limit of ${FREE_LIMITS.aiMessagesPerDay} AI messages per day reached`,
          "LIMIT_REACHED",
        );
      }
    }

    const context = ContextGatherer.gather();

    const recentMessages = this.getRecentMessages(20);
    const apiMessages = [
      { role: "system" as const, content: SYSTEM_PROMPT + "\n\n" + ContextGatherer.formatForPrompt(context) },
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          stream: !!onChunk,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AIServiceError(
          `API error: ${response.status} ${errorText}`,
          "API_ERROR",
        );
      }

      if (onChunk && response.body) {
        let fullResponse = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                fullResponse += delta;
                onChunk(fullResponse);
              }
            } catch {}
          }
        }

        this.saveMessage("assistant", fullResponse);
        return fullResponse;
      }

      const json = await response.json();
      const assistantMessage = json.choices?.[0]?.message?.content ?? "I couldn't generate a response.";
      this.saveMessage("assistant", assistantMessage);
      return assistantMessage;
    } catch (e) {
      if (e instanceof AIServiceError) throw e;
      throw new AIServiceError(`Failed to reach AI: ${(e as Error).message}`, "API_ERROR");
    }
  },
};
