
interface SUmmarizedCardProps {
    title: string;
    description: string;
}

export function SummarizedCard({ title, description }: SUmmarizedCardProps) {
    return (
        <div className="p-1 border rounded-[12px]">
            <h1>Noted on Index.hr</h1>
            <div className="flex flex-col p-4 border rounded-[12px]">
                <h1>{title}</h1>
                <p>{description}</p>
            </div>
        </div>
    )
}