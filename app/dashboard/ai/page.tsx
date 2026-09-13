"use client";

import { Bot, Send, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { chatWithAdvisor } from "@/actions/ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdvisorMessage } from "@/lib/ai-types";

const suggestions = ["Where am I spending the most?", "How can I save $300 more this month?", "Give me a simple spending review"];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<AdvisorMessage[]>([{ role: "model", text: "I’m your Coinly advisor. Ask me anything about your spending, savings, or next financial move." }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pending]);

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const nextMessages = [...messages, { role: "user" as const, text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    try { const reply = await chatWithAdvisor(nextMessages); setMessages([...nextMessages, { role: "model", text: reply }]); } catch (error) { setMessages([...nextMessages, { role: "model", text: error instanceof Error ? error.message : "I couldn't answer that right now." }]); } finally { setPending(false); }
  }

  return <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-4xl flex-col gap-5"><header><div className="flex items-center gap-2 text-emerald-600"><Sparkles className="h-4 w-4" /><p className="text-sm font-medium">Coinly intelligence</p></div><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">AI Advisor</h1><p className="mt-2 text-sm text-slate-500">A private conversation grounded in your current financial picture.</p></header><Card className="flex min-h-[32rem] flex-1 flex-col border-slate-200/80 shadow-none dark:border-slate-800 dark:bg-slate-950/50"><div className="flex-1 space-y-5 overflow-y-auto p-5">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}><Avatar className="h-8 w-8"><AvatarFallback className={message.role === "model" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}>{message.role === "model" ? <Bot className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}</AvatarFallback></Avatar><div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>{message.text}</div></div>)}{pending && <div className="flex items-center gap-2 text-sm text-slate-400"><Bot className="h-4 w-4 animate-pulse" />Thinking...</div>}<div ref={bottomRef} /></div><div className="border-t border-slate-200 p-4 dark:border-slate-800"><div className="mb-3 flex flex-wrap gap-2">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void send(suggestion)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700">{suggestion}</button>)}</div><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}><Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your finances..." /><Button type="submit" className="h-11 w-11 shrink-0 p-0" disabled={pending || !input.trim()} aria-label="Send message"><Send className="h-4 w-4" /></Button></form></div></Card></div>;
}
