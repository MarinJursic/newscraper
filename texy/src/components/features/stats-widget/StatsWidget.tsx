import { TrendingUp } from "lucide-react"

export function StatsWidget() {
    return (
        <div className="p-1 border rounded-[12px] bg-orange-50 w-full max-w-[400px]">
            <h1 className="pl-2 py-2 text-[12px] font-medium text-orange-900">Daily Activity</h1>
            <div className="flex flex-col p-4 border rounded-[12px] bg-white space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Articles Read</span>
                    <span className="text-xl font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Saved</span>
                    <span className="text-xl font-bold text-green-600">45m</span>
                </div>
                <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>15% more than yesterday</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
