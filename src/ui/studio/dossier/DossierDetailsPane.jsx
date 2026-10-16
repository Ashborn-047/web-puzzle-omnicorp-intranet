import React from 'react';
import {
    AlertTriangle, Sparkles, Key, Copy, MessageSquare,
    FileText, CheckCircle2, GitCommit, ArrowRight
} from 'lucide-react';

export default function DossierDetailsPane({
    character,
    characters = [],
    characterPlotHoles = [],
    relatedLinks = [],
    editableLore,
    setEditableLore,
    isSavingLore,
    loreSavedSuccess,
    onSaveManualLore,
    onFixWithAi,
    onCopyClue,
    onCopyQuote
}) {
    return (
        <div className="space-y-4">
            {/* Real-time Narrative Plot Hole Alert */}
            {characterPlotHoles.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                            <AlertTriangle size={15} className="text-amber-600" />
                            <span>Narrative Audit: {characterPlotHoles.length} Plot Hole Issue{characterPlotHoles.length > 1 ? 's' : ''} Flagged</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onFixWithAi(characterPlotHoles[0])}
                            className="px-2.5 py-1 bg-[#3b2a5a] text-[#ffd6e8] hover:bg-[#2c1e44] rounded-xl text-[11px] font-bold flex items-center gap-1 border border-[#ff9ec7] transition-all cursor-pointer shadow-xs"
                        >
                            <Sparkles size={12} className="text-[#ff9ec7]" />
                            <span>Fix with AI Co-Writer</span>
                        </button>
                    </div>
                    <div className="space-y-1 text-xs text-amber-900">
                        {characterPlotHoles.map((ph, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 pl-1 leading-snug">
                                <span className="font-bold shrink-0">• {ph.title}:</span>
                                <span className="text-amber-900/80">{ph.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clue & Recorded Voice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Clue / Credential */}
                <div className="bg-gradient-to-br from-[#fff5f9] to-[#ffd6e8]/40 p-4 rounded-2xl border border-[#ff9ec7]/80 shadow-[0_2px_8px_rgba(255,158,199,0.12)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                            <Key size={14} className="text-[#ff70aa]" />
                            <span>Forensic Clue / Credential Held</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#3b2a5a] leading-relaxed">
                            {character.clueHeld || 'No forensic clue or security credential specified for this employee.'}
                        </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#ff9ec7]/40 flex items-center justify-between text-[11px] text-[#3b2a5a]/70 font-mono">
                        <span>Clearance: {character.clearance}</span>
                        <button
                            type="button"
                            onClick={onCopyClue}
                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                </div>

                {/* Voice / Chat Residue */}
                <div className="bg-white p-4 rounded-2xl border border-[#c9b6ff] shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                            <MessageSquare size={14} className="text-[#7c5cb7]" />
                            <span>Recorded Voice / Chat Residue</span>
                        </div>
                        <blockquote className="text-xs sm:text-sm text-[#3b2a5a] italic leading-relaxed pl-3 border-l-2 border-[#ff9ec7]">
                            "{character.messageSnippet || 'No recorded audio log or terminal chat residue discovered in this iteration.'}"
                        </blockquote>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#c9b6ff]/40 flex items-center justify-between text-[11px] text-[#3b2a5a]/70 font-mono">
                        <span>#{character.dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}-internal</span>
                        <button
                            type="button"
                            onClick={onCopyQuote}
                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Expansive Character Backstory & Lore Notes Editor */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#3b2a5a]" />
                        <h3 className="text-sm font-bold text-[#3b2a5a]">
                            Character Backstory, Secret Motives & Lore Notes
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#3b2a5a]/60">
                        {editableLore ? `${editableLore.split(/\s+/).filter(Boolean).length} words • ${editableLore.length} chars` : '0 words'}
                    </span>
                </div>

                <textarea
                    value={editableLore}
                    onChange={(e) => setEditableLore(e.target.value)}
                    rows={10}
                    placeholder="Enter detailed backstory, psychological state, hidden motives, or secret interactions..."
                    className="w-full p-4 bg-[#fbf7ff] border border-[#c9b6ff] rounded-2xl text-xs sm:text-sm text-[#3b2a5a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] focus:bg-white transition-all resize-y min-h-[180px]"
                />

                <div className="flex items-center justify-between pt-1">
                    {loreSavedSuccess ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 size={14} /> Backstory saved to studio roster & storage!
                        </span>
                    ) : (
                        <span className="text-[11px] text-[#3b2a5a]/60">
                            You can edit this narrative directly or click apply buttons from the AI Co-Writer.
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={onSaveManualLore}
                        disabled={isSavingLore}
                        className="px-4 py-2 bg-[#3b2a5a] hover:bg-[#2c1e44] text-[#ffd6e8] rounded-xl font-bold text-xs border border-[#ff9ec7] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {isSavingLore ? 'Saving...' : 'Save Backstory'}
                    </button>
                </div>
            </div>

            {/* Connected Narrative Decision Lines in Decision Graph */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GitCommit size={16} className="text-[#3b2a5a]" />
                        <h3 className="text-sm font-bold text-[#3b2a5a]">
                            Connected Narrative Decision Lines ({relatedLinks.length})
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#3b2a5a]/60">Active in Graph Map</span>
                </div>

                {relatedLinks.length === 0 ? (
                    <div className="p-3.5 bg-[#fbf7ff] rounded-xl border border-dashed border-[#c9b6ff] text-xs text-[#3b2a5a]/70 text-center">
                        No decision lines currently connect to {character.name}. You can link them to other employees in the <strong>Decision Graph</strong> tab!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {relatedLinks.map((link, idx) => {
                            const fromChar = characters.find(c => c.id === link.fromCharId);
                            const toChar = characters.find(c => c.id === link.toCharId);
                            return (
                                <div 
                                    key={idx}
                                    className="p-3 bg-[#fbf7ff] hover:bg-[#ffd6e8]/20 rounded-xl border border-[#c9b6ff]/70 text-xs flex items-center justify-between gap-3 transition-colors"
                                >
                                    <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-[#3b2a5a]">
                                        <span>{fromChar?.name || 'Unknown'}</span>
                                        <ArrowRight size={12} className="text-[#ff9ec7]" />
                                        <span>{toChar?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="text-[#3b2a5a]/80 font-medium truncate max-w-[280px]">
                                        {link.stepName || link.investigationAction}
                                    </div>
                                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#c9b6ff] shrink-0">
                                        {link.unlocksType || 'Narrative Clue'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
