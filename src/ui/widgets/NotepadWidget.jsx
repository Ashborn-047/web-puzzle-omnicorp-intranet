import React from 'react';
import { StickyNote, X } from 'lucide-react';

const NotepadWidget = ({ notes, onClose }) => {
    if (!notes || notes.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 w-72 bg-yellow-50 border-2 border-yellow-200 shadow-xl rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-500 z-50">
            <div className="bg-yellow-100 p-2 border-b border-yellow-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-yellow-800 font-bold text-xs uppercase tracking-widest">
                    <StickyNote size={14} />
                    <span>System Residue</span>
                </div>
                <button onClick={onClose} className="text-yellow-600 hover:text-yellow-800 transition-colors">
                    <X size={14} />
                </button>
            </div>
            <div className="p-4 font-mono text-xs text-yellow-900 space-y-4 max-h-96 overflow-y-auto leading-relaxed">
                {notes.map((note, idx) => (
                    <div key={idx} className="border-l-2 border-yellow-300 pl-3 py-1 italic">
                        {note}
                    </div>
                ))}
            </div>
            <div className="bg-yellow-100/50 p-2 text-[10px] text-yellow-600 text-center font-bold uppercase tracking-tighter">
                Trace ID: SYS-9000-VOLATILE
            </div>
        </div>
    );
};

export default NotepadWidget;
