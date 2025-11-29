import React from 'react';
import { Tag } from 'lucide-react';

interface TopTagsWidgetProps {
    tags: Array<{ tag: string; count: number }>;
}

const TopTagsWidget: React.FC<TopTagsWidgetProps> = ({ tags }) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-slate-900">Your Top Tags</h3>
            </div>

            <div className="space-y-3">
                {tags.map((item, idx) => (
                    <div key={item.tag} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-violet-50 rounded-md flex items-center justify-center text-xs font-bold text-violet-600">
                                {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-slate-700">{item.tag}</span>
                        </div>
                        <span className="text-xs text-slate-400 bg-gray-100 px-2 py-1 rounded-full">
                            {item.count} saved
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                    <strong>Insight:</strong> You save a lot about <span className="text-violet-600 font-medium">{tags[0]?.tag}</span>
                </p>
            </div>
        </div>
    );
};

export default TopTagsWidget;
