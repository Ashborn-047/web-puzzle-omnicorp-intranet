import React from 'react';
import { RefreshCw, Plus, Edit3 } from 'lucide-react';

export default function AssistantChatBubble({
    message,
    modelTag,
    onImportCharacter,
    onOpenAddModal
}) {
    // Helper to extract JSON from assistant message for 1-click import
    const extractCharacterJson = (text) => {
        if (!text) return null;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) return null;
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.name && parsed.badgeId) {
                return parsed;
            }
        } catch {
            return null;
        }
        return null;
    };

    const charJson = message.role === 'assistant' ? extractCharacterJson(message.content) : null;

    return (
        <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="text-[10px] font-mono font-bold text-[#3b2a5a]/60 mb-1 px-1">
                {message.role === 'user' ? 'Architect' : modelTag}
            </div>
            <div
                className={`rounded-2xl p-3.5 max-w-[92%] ${
                    message.role === 'user'
                        ? 'bg-[#3b2a5a] text-[#ffd6e8] border border-[#ff9ec7] rounded-br-sm shadow-md'
                        : 'bg-white border border-[#c9b6ff] text-[#3b2a5a] rounded-bl-sm shadow-[0_2px_8px_rgba(59,42,90,0.05)]'
                }`}
            >
                {message.role === 'assistant' && message.reasoning && (
                    <details 
                        className="mb-2 text-[11px] text-[#3b2a5a]/75 bg-[#f3e8ff]/70 border border-[#c9b6ff]/60 rounded-xl p-2 cursor-pointer group"
                        open={!message.content && message.isStreaming}
                    >
                        <summary className="font-mono font-bold text-[10px] text-[#3b2a5a]/80 select-none flex items-center justify-between list-none">
                            <span className="flex items-center gap-1.5">
                                <span className="text-[#ff9ec7]">💭</span>
                                <span>{message.content ? 'Reasoning Process' : 'Formulating thoughts...'}</span>
                            </span>
                            <span className="text-[9px] opacity-60 font-normal">
                                {message.content ? 'Click to expand' : 'Streaming thoughts...'}
                            </span>
                        </summary>
                        <div className="mt-1.5 pt-1.5 border-t border-[#c9b6ff]/40 text-[#3b2a5a]/80 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {message.reasoning}
                        </div>
                    </details>
                )}

                {message.content ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : message.isStreaming ? (
                    <div className="text-[11px] text-[#3b2a5a]/60 italic flex items-center gap-1.5 py-1">
                        <RefreshCw size={12} className="animate-spin text-[#ff9ec7]" />
                        <span>Synthesizing response...</span>
                    </div>
                ) : null}

                {/* 1-Click Character Importer & Form Actions */}
                {charJson && (
                    <div className="mt-3 pt-3 border-t border-[#c9b6ff]/60 bg-[#f3e8ff]/70 -mx-1 px-3.5 py-2.5 rounded-xl space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <span className="text-[10px] uppercase font-mono font-bold text-[#3b2a5a]/60 block">Proposed Character</span>
                                <span className="text-xs font-bold text-[#3b2a5a]">{charJson.name} ({charJson.badgeId})</span>
                                <span className="text-[10px] text-[#3b2a5a]/75 block">{charJson.title} • {charJson.dept}</span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#c9b6ff] text-[#3b2a5a] font-bold shrink-0">
                                {charJson.clearance}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-[#c9b6ff]/40">
                            <button
                                type="button"
                                onClick={() => onImportCharacter(charJson)}
                                className="flex-1 px-3 py-1.5 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#ff8dbb] shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <Plus size={13} /> 1-Click Add
                            </button>
                            {onOpenAddModal && (
                                <button
                                    type="button"
                                    onClick={() => onOpenAddModal(charJson)}
                                    className="flex-1 px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#c9b6ff] shadow-xs transition-all cursor-pointer active:scale-95"
                                    title="Open in Add Character form to review and edit before saving"
                                >
                                    <Edit3 size={12} /> Review in Form
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
