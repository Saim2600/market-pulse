"use client";

import { useState } from "react";
import { useApiAuth } from "@/hooks/useApiAuth";
import { campaignService } from "@/services/campaignService";
import { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Why is ROI decreasing?",
  "Which campaign performs best?",
  "Predict next month's performance.",
  "Summarize overall performance.",
  "Give me 3 recommendations to improve CAC.",
];

export default function CopilotPage() {
  useApiAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", message: text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await campaignService.chat(text);
      setMessages((m) => [...m, { role: "assistant", message: res.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", message: "Sorry, I couldn't reach the AI service." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Copilot</h1>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => send(s)} className="text-xs glass px-3 py-1.5 hover:bg-white/10">
            {s}
          </button>
        ))}
      </div>

      <div className="glass p-4 h-[440px] overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && <p className="text-white/40 text-sm">Ask me anything about your campaign data.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "self-end bg-indigo-500/30" : "self-start bg-white/10"}`}>
            {m.message}
          </div>
        ))}
        {loading && <div className="self-start text-white/40 text-sm">Thinking…</div>}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask the AI Copilot…"
          className="flex-1 glass px-3 py-2 text-sm bg-transparent outline-none"
        />
        <Button onClick={() => send(input)} disabled={loading}>Send</Button>
      </div>
    </div>
  );
}
