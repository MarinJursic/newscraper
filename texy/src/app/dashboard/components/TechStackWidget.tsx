import React from 'react';
import { Code } from 'lucide-react';

interface TechStackWidgetProps {
    techStack?: string[];
}

const TechStackWidget: React.FC<TechStackWidgetProps> = ({ techStack }) => {
    if (!techStack || techStack.length === 0) return null;

    return (
        <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                <Code className="w-3 h-3" /> Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
                {techStack.map((tech, idx) => (
                    <span
                        key={idx}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-100"
                    >
                        {tech}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TechStackWidget;

