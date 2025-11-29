import { NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 30;

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    const systemMessage = {
      role: "system" as const,
      content: `You are 'Texy Copilot', an expert cybersecurity and tech news analyst.
    
CONTEXT:
The user is reading an article. Here is the content:
${context || "No article context provided."}

INSTRUCTIONS:
1. Answer based on the provided context.
2. Be concise, professional, and helpful.
3. If the user asks for code/fixes, provide snippets.
4. Do not hallucinate facts not present in the context or general knowledge.
5. Focus on cybersecurity implications, technical details, and actionable insights.`,
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        systemMessage,
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({
      message: assistantMessage,
      content: assistantMessage,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
