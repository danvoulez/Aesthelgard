import React from "react";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "ai";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? "bg-indigo-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tl-sm shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
