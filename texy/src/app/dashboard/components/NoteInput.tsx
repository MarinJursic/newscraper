import React from 'react';

interface NoteInputProps {
    selection: { top: number; left: number; text: string } | null;
    editingNote: string;
    setEditingNote: (note: string) => void;
    addHighlight: (note: string) => void;
    cancelHighlight: () => void;
    noteInputRef: React.RefObject<HTMLInputElement | null>;
}

const NoteInput: React.FC<NoteInputProps> = ({
    selection,
    editingNote,
    setEditingNote,
    addHighlight,
    cancelHighlight,
    noteInputRef
}) => {
    if (!selection) return null;

    return (
        <div
            className="fixed z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
                top: selection.top,
                left: selection.left,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[300px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
                    <span className="text-xs font-medium text-slate-600">Add note to highlight</span>
                </div>
                <input
                    ref={noteInputRef}
                    type="text"
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            addHighlight(editingNote);
                        } else if (e.key === 'Escape') {
                            cancelHighlight();
                        }
                    }}
                    placeholder="Type your note (optional)..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 mb-2"
                />
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">Press Enter to save, Esc to cancel</span>
                    <div className="flex gap-2">
                        <button
                            onClick={cancelHighlight}
                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => addHighlight(editingNote)}
                            className="text-xs bg-violet-600 text-white px-3 py-1 rounded-lg hover:bg-violet-700 transition-colors font-medium"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45 absolute left-1/2 -bottom-1.5 -translate-x-1/2"></div>
        </div>
    );
};

export default NoteInput;
