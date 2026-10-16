import React from 'react';
import { CornerDownRight, Network, Plus, ArrowRight, Trash2 } from 'lucide-react';

export default function DecisionLinesTab({
    characters = [],
    decisionLines = [],
    onOpenGraphTab,
    onOpenAddModal,
    onDeleteLine
}) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
                <div>
                    <h3 className="text-sm font-bold text-[#3b2a5a] flex items-center gap-2">
                        <CornerDownRight size={18} className="text-[#ff9ec7]" />
                        Investigation Clue Pathway (Decision Lines)
                    </h3>
                    <p className="text-xs text-[#3b2a5a]/70">
                        Defines how the protagonist navigates from one employee to another through discovered clues, unredacted reports, or hijacked sessions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenGraphTab}
                        className="px-3.5 py-2 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] border border-[#c9b6ff] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_1px_3px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all cursor-pointer"
                    >
                        <Network size={14} /> Open Obsidian Graph Map
                    </button>
                    <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all cursor-pointer"
                    >
                        <Plus size={16} /> Add Decision Line
                    </button>
                </div>
            </div>

            {/* DECISION LINES TIMELINE / CHAIN */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-12">
                {decisionLines.map((dl, idx) => {
                    const fromChar = characters.find(c => c.id === dl.fromCharId);
                    const toChar = characters.find(c => c.id === dl.toCharId);

                    return (
                        <div
                            key={dl.id}
                            className="bg-white/95 border border-[#c9b6ff] shadow-[0_6px_20px_rgba(59,42,90,0.06),0_1px_3px_rgba(59,42,90,0.02),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)] hover:shadow-[0_10px_28px_rgba(59,42,90,0.12),inset_0_1.5px_0_rgba(255,255,255,1)] hover:border-[#ff9ec7] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group transition-all relative"
                        >
                            {/* Step Number with beveled ring */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-9 h-9 rounded-xl bg-[#ffd6e8] border border-[#ff9ec7] text-[#3b2a5a] font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_2px_4px_rgba(255,158,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                    {idx + 1}
                                </div>

                                {/* Pathway Visual with beveled chips */}
                                <div className="flex items-center gap-2 font-mono text-xs">
                                    <div className="bg-[#f3e8ff] px-3.5 py-2 rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)]">
                                        <span className="font-bold text-[#3b2a5a] block">{fromChar ? fromChar.name : dl.fromCharId}</span>
                                        <span className="text-[10px] text-[#3b2a5a]/70 block font-sans">{fromChar?.dept || 'Unknown'}</span>
                                    </div>

                                    <div className="text-[#ff9ec7] px-1 font-bold">
                                        <ArrowRight size={16} />
                                    </div>

                                    <div className="bg-[#f3e8ff] px-3.5 py-2 rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)]">
                                        <span className="font-bold text-[#3b2a5a] block">{toChar ? toChar.name : dl.toCharId}</span>
                                        <span className="text-[10px] text-[#3b2a5a]/70 block font-sans">{toChar?.dept || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 min-w-[200px] text-xs">
                                <div className="flex items-center gap-2.5 mb-1.5">
                                    <span className="font-bold text-[#3b2a5a] text-sm tracking-tight">{dl.stepName || 'Investigation Step'}</span>
                                    {dl.unlocksType && (
                                        <span className="text-[10px] bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7] px-2.5 py-0.5 rounded-full font-bold shadow-[0_1px_2px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                            {dl.unlocksType}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[#3b2a5a]/80 mb-1 leading-relaxed text-[11px]"><span className="text-[#3b2a5a] font-bold">Action:</span> {dl.investigationAction}</p>
                                <div className="bg-gradient-to-r from-[#fff5f9] to-[#ffd6e8] border border-[#ff9ec7]/60 p-2.5 rounded-xl text-[#3b2a5a] text-[11px] font-sans shadow-[0_1px_2px_rgba(255,158,199,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                    <span className="text-[#3b2a5a] font-bold mr-1.5">🔑 Clue / Unlock:</span> {dl.clueDiscovered}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 self-end md:self-center">
                                <button
                                    type="button"
                                    onClick={() => onDeleteLine(dl.id)}
                                    className="p-2 hover:bg-[#ffd6e8] text-[#3b2a5a]/60 hover:text-[#3b2a5a] rounded-xl transition-colors border border-transparent hover:border-[#ff9ec7] cursor-pointer"
                                    title="Delete decision step"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
