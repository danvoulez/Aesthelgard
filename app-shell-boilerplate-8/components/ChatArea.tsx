"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { useNarrative } from "@/lib/narrative-context";
import { GoogleGenAI } from "@google/genai";
import { buildDeterministicContext, validateAIResponse, getAIInvariants } from "@/lib/canonUtils";
import { SessionType } from "@/schemas/canon";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function ChatArea() {
  const { currentChapter, advanceChapter, userState, updateInventory, updateHandoverNote } = useNarrative();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Terminal active. Awaiting input.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('assist');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing Gemini API Key");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      // Hardcode location/year for now, or pull from chapter if available
      const currentLocationId = 'loc-1';
      const currentYear = 150;
      
      const aiInvariants = getAIInvariants();
      const contextString = buildDeterministicContext(currentLocationId, currentYear, userState);
      
      // The Handover Injection
      const handoverInjection = `
[BASELINE NARRATIVE]
${userState.baselineNarrative}

[LAST HANDOVER NOTE]
${userState.lastHandoverNote}

[SESSION TYPE RULES]
You are currently operating in '${sessionType}' mode. Adjust your tone and verbosity accordingly.
`;

      const systemInstruction = `${aiInvariants}\n${contextString}\n${handoverInjection}\nYou must respond using the exact JSON structure defined in the AIResponseSchema, providing narrativeText, a handover_note, and any updatedStateVariables.`;

      // Only send the last 4 messages to prevent token bloat
      const recentMessages = newMessages.slice(-4);
      const contents = recentMessages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const validatedResponse = validateAIResponse(responseText);

      // Check triggers for advancing chapter
      const lowerContent = content.toLowerCase();
      const triggers = currentChapter.triggerKeywords || [];
      const triggered = triggers.some((keyword) => lowerContent.includes(keyword));

      if (triggered) {
        advanceChapter();
      }

      // Apply any state updates from AI
      if (validatedResponse.updatedStateVariables) {
        if (validatedResponse.updatedStateVariables.discoveredArtifacts) {
          validatedResponse.updatedStateVariables.discoveredArtifacts.forEach(art => {
            updateInventory(art);
          });
        }
      }

      // Silently update the handover note in the background
      if (validatedResponse.handover_note) {
        updateHandoverNote(validatedResponse.handover_note);
      }

      const newAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: validatedResponse.narrativeText,
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "The Archivist's connection to the flow was interrupted. Please ask again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex-shrink-0 h-12 md:h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 md:px-6 z-10">
        <h2 className="text-base md:text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Comms Link
        </h2>
        <select 
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value as SessionType)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="assist">Assist Mode</option>
          <option value="work">Work Mode</option>
          <option value="deliberate">Deliberate Mode</option>
          <option value="research">Research Mode</option>
        </select>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto flex flex-col">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
