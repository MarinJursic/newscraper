"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface TrendingCardProps {
    title?: string
    data: Array<Record<string, string | number>>
    dataKey: string
    xAxisKey?: string
    color?: string
    className?: string
    showGrid?: boolean
    showTooltip?: boolean
    dateFormat?: "short" | "medium" | "long"
}

function formatDate(dateStr: string, format: "short" | "medium" | "long"): string {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    switch (format) {
        case "short":
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        case "medium":
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
        case "long":
            return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        default:
            return dateStr
    }
}

function formatTooltipDate(dateStr: string): string {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

export function TrendingCard({
    title,
    data,
    dataKey,
    xAxisKey = "date",
    color = "#8b5cf6",
    className,
    showGrid = true,
    showTooltip = true,
    dateFormat = "short",
}: TrendingCardProps) {
    // Format data for display
    const formattedData = data.map((item) => ({
        ...item,
        formattedDate: formatDate(String(item[xAxisKey]), dateFormat),
    }))

    return (
        <div className={cn("w-full rounded-2xl border border-gray-200 bg-white p-6", className)}>
            {title && (
                <h3 className="mb-4 text-sm font-bold text-slate-900">
                    {title}
                </h3>
            )}
            <div className="h-[160px] w-full -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={formattedData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        {showGrid && (
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                                strokeOpacity={0.6}
                                vertical={false}
                            />
                        )}
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            tickLine={false}
                            axisLine={false}
                            interval="preserveStartEnd"
                            tickMargin={12}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={40}
                            tickFormatter={(value) => value.toLocaleString()}
                        />
                        {showTooltip && (
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    padding: "10px 14px",
                                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                                }}
                                labelStyle={{
                                    color: "#0f172a",
                                    fontWeight: 600,
                                    marginBottom: "4px",
                                }}
                                itemStyle={{
                                    color: "#64748b",
                                    padding: 0,
                                }}
                                labelFormatter={(_, payload) => {
                                    if (payload?.[0]?.payload?.[xAxisKey]) {
                                        return formatTooltipDate(String(payload[0].payload[xAxisKey]))
                                    }
                                    return ""
                                }}
                                cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{
                                r: 5,
                                fill: color,
                                stroke: "#fff",
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
