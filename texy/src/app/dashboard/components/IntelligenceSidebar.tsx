"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, Bot, Send, Trash2, User, Loader2 } from "lucide-react";

interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Highlight {
  id: string;
  text: string;
  note: string;
  color: string;
}

interface IntelligenceSidebarProps {
  activeTab: "chat" | "notes";
  setActiveTab: (tab: "chat" | "notes") => void;
  highlights: Highlight[];
  updateNote: (id: string, note: string) => void;
  deleteHighlight: (id: string) => void;
  articleContext?: string;
}

const IntelligenceSidebar: React.FC<IntelligenceSidebarProps> = ({
  activeTab,
  setActiveTab,
  highlights,
  updateNote,
  deleteHighlight,
  articleContext = "",
}) => {
  // --- Manual Chat State ---
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I've analyzed this article. I can help you summarize the impact, explain technical details, or suggest remediation steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: articleContext,
        }),
      });

      const data = await response.json();

      const assistantMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.message || data.content || "Sorry, I encountered an error.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning>
      {/* --- Tabs --- */}
      <div className="flex border-b border-gray-200 flex-shrink-0 bg-white sticky top-0 z-10">
        <button
          onClick={() => setActiveTab("notes")}
          className={`cursor-pointer flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "notes"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Notes
          {highlights.length > 0 && (
            <span className="bg-violet-100 text-violet-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {highlights.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`cursor-pointer flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
            activeTab === "chat"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bot className="w-4 h-4" />
          Copilot
        </button>
      </div>

      {/* --- Content --- */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
        {activeTab === "notes" ? (
          /* NOTES TAB CONTENT */
          <div className="space-y-4">
            {highlights.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Select text to add a note.</p>
                <p className="text-xs mt-1">Highlights appear inline.</p>
              </div>
            ) : (
              highlights.map((highlight) => (
                <div
                  key={highlight.id}
                  className="bg-white p-3 rounded-lg border border-gray-200 group hover:border-violet-200 transition-colors shadow-sm"
                >
                  <div className="border-l-2 border-yellow-400 pl-3 mb-3 bg-yellow-50/50 py-1 rounded-r">
                    <p className="text-xs text-slate-600 italic line-clamp-3">
                      &ldquo;{highlight.text}&rdquo;
                    </p>
                  </div>
                  <textarea
                    placeholder="Add a comment..."
                    value={highlight.note}
                    onChange={(e) => updateNote(highlight.id, e.target.value)}
                    className="w-full text-sm bg-white border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 rounded p-2 mb-2 resize-none transition-all outline-none"
                    rows={2}
                  />
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => deleteHighlight(highlight.id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* CHAT TAB CONTENT */
          <div className="flex flex-col h-full">
            <div className="flex-1 space-y-4 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "assistant"
                        ? "bg-violet-100"
                        : "bg-slate-200"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-violet-600" />
                    ) : (
                      <User className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-lg text-sm max-w-[85%] ${
                      msg.role === "assistant"
                        ? "bg-white border border-gray-200 text-slate-600 rounded-tl-none shadow-sm"
                        : "bg-violet-600 text-white rounded-tr-none shadow-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-lg rounded-tl-none text-sm text-slate-400 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="relative pt-2 bg-slate-50/30"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Copilot..."
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-4.5 p-1.5 text-violet-600 hover:bg-violet-50 rounded-full disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligenceSidebar;
