import { NextRequest, NextResponse } from "next/server";
import { createUIMessageStreamResponse, streamText, UIMessage } from "ai";
import { toUIMessageStream } from '@ai-sdk/langchain';
import { getVectorStore } from "@/lib/vector-store";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone-client";
import { Message } from "@/components/chat-line";
import { processUserMessage } from "@/lib/lanngchain";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request
    const body = await req.json();
    console.log(body)
    const messages: UIMessage[] = body.messages ?? [];

    if (!messages.length) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }
    const currentMessage = messages[messages.length - 1] as UIMessage;
    const currentQuestion = currentMessage?.parts?.[0]?.text;
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map((message: UIMessage) =>
      `${message.role === "user" ? "Human" : "Assistant"}: ${message.role}`
      )
      .join("\n");
    if (!currentQuestion?.trim()) {
      return NextResponse.json(
      { error: "Empty question provided" },
      { status: 400 }
      );
    }
    
    // // Format conversation history
    // const formattedPreviousMessages = messages
    //   .slice(0, -1)
    //   .map(
    //     (message) =>
    //       `${message.role === "user" ? "Human" : "Assistant"}: ${
    //         message.
    //       }`
    //   )
    //   .join("\n");

    // Initialize model and vector store
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      // temperature: 0.1,
      streaming: true,
    });
    const pc = await getPineconeClient();
    const vectorStore = await getVectorStore(pc);
    const parser = new StringOutputParser();
    const stream = await processUserMessage({
      userPrompt: currentQuestion,
      conversationHistory: formattedPreviousMessages,
      vectorStore,
      model,
    });
    // console.log("message answer =>", stream);
    // console.log("message inquiry =>", inquiry);
    // Convert the stream using the new adapter
      return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
