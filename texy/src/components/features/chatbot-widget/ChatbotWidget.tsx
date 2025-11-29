"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChatbotWidget() {
    return (
        <div className="flex flex-col h-full p-1 border rounded-[12px] bg-blue-50 w-full max-w-[400px]">
            <div className="flex items-center gap-2 pl-2 py-2">
                <div className="p-1 bg-blue-100 rounded-md">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <h1 className="text-[12px] font-medium text-blue-900">AI Assistant</h1>
            </div>

            <div className="flex flex-col flex-1 p-4 border rounded-[12px] bg-white justify-between gap-4">
                <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none text-sm">
                        Hello! How can I help you analyze the news today?
                    </div>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Ask anything..."
                        className="h-9 text-sm bg-muted/20 border-muted-foreground/20"
                    />
                    <Button size="sm" className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
