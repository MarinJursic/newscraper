import React from 'react';
import { BookmarkX } from 'lucide-react';

interface EmptyStateProps {
    folderName: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ folderName }) => {
    return (
        <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookmarkX className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
                {folderName === 'All Saved' ? 'No saved articles yet' : `No articles in ${folderName}`}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {folderName === 'All Saved'
                    ? 'Start building your knowledge base by saving articles from the Dashboard or Explore page.'
                    : 'Move articles to this folder to organize your library.'}
            </p>
        </div>
    );
};

export default EmptyState;
