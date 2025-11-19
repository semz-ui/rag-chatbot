"use client";

import { scrollToBottom, initialMessages, getSources } from "@/lib/utils";
import { ChatLine, Message } from "./chat-line";
import { useChat } from "@ai-sdk/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import React, { useEffect, useRef } from "react";

export function Chat() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { messages, status, sendMessage, } =
    useChat();
const [input, set_input ] =  React.useState("");

  const handleSbbmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(
      {
        text: input,
        metadata: {
          role: "user",
          assistant: initialMessages
        }
      }
    );
    set_input("");
  }

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  console.log("Messages:", messages);
  console.log("Status:", status);


  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index:any) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
            // Start from the third message of the assistant
            sources={messages?.length ? getSources(messages, role, index) : []}
          />
        ))}
      </div>

      <form onSubmit={handleSbbmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={
            (e) => set_input(e.target.value)
          }
          className="mr-2"
        />

        <Button type="submit" className="w-24">
          {status === "streaming" ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}
