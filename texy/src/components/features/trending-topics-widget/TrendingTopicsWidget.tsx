import { Hash } from "lucide-react"

const topics = [
    { name: "Technology", count: 124 },
    { name: "AI & ML", count: 89 },
    { name: "Cybersecurity", count: 56 },
    { name: "Startups", count: 34 },
]

export function TrendingTopicsWidget() {
    return (
        <div className="p-1 border rounded-[12px] bg-purple-50 w-full max-w-[400px]">
            <h1 className="pl-2 py-2 text-[12px] font-medium text-purple-900">Trending Topics</h1>
            <div className="flex flex-col p-4 border rounded-[12px] bg-white space-y-3">
                {topics.map((topic) => (
                    <div key={topic.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded">
                                <Hash className="h-3 w-3 text-purple-600" />
                            </div>
                            <span className="text-sm font-medium">{topic.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{topic.count} articles</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
