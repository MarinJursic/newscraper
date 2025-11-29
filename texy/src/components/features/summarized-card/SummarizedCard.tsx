
interface SUmmarizedCardProps {
    title: string;
    description: string;
}

export function SummarizedCard({ title, description }: SUmmarizedCardProps) {
    return (
        <div className="p-1 border rounded-[12px] bg-green-50 max-w-[400px]">
            <h1 className="pl-2 py-2 text-[12px]">Noted on Index.hr • 27.05.2025.</h1>
            <div className="flex flex-col p-4 border rounded-[12px] bg-white space-y-2">
                <h1 className="font-medium">{title}</h1>
                <p className="text-[14px]">{description}</p>
            </div>
        </div>
    )
}