import React from 'react';
import { CornerDownRight, X, Plus } from 'lucide-react';

export default function DecisionLineModal({
    isOpen,
    onClose,
    characters = [],
    linkData,
    setLinkData,
    onSave
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-[#3b2a5a]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#c9b6ff] w-full max-w-xl rounded-3xl shadow-[0_20px_50px_rgba(59,42,90,0.2),inset_0_2px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[#c9b6ff] flex justify-between items-center bg-[#f3e8ff]/50">
                    <h3 className="font-bold text-[#3b2a5a] text-sm flex items-center gap-2">
                        <CornerDownRight size={16} className="text-[#ff9ec7]" />
                        Add Investigation Decision Line
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#3b2a5a]/60 hover:text-[#3b2a5a] p-1 rounded-lg hover:bg-[#ffd6e8]/40 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSave} className="p-6 space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                Source Character (Investigating As)
                            </label>
                            <select
                                required
                                value={linkData.fromCharId}
                                onChange={e => setLinkData({ ...linkData, fromCharId: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                            >
                                <option value="">-- Select Source --</option>
                                {characters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.dept})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                                Target Character Discovered / Unlocked
                            </label>
                            <select
                                required
                                value={linkData.toCharId}
                                onChange={e => setLinkData({ ...linkData, toCharId: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                            >
                                <option value="">-- Select Target --</option>
                                {characters.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.dept})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                            Step Name
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Uncovering the Procurement Paper Trail"
                            value={linkData.stepName}
                            onChange={e => setLinkData({ ...linkData, stepName: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                            Investigation Action
                        </label>
                        <input
                            type="text"
                            placeholder="What does the player do? (e.g. Reads Sarah's email dispute with Lumbergh)"
                            value={linkData.investigationAction}
                            onChange={e => setLinkData({ ...linkData, investigationAction: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                            Clue / Credential Discovered
                        </label>
                        <input
                            type="text"
                            placeholder="What clue is gained? (e.g. Finds PO-4412 for Cryo-Organ preservation)"
                            value={linkData.clueDiscovered}
                            onChange={e => setLinkData({ ...linkData, clueDiscovered: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                            Unlocks Type / Tag
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Credentials, Terminal Backdoor, Vault PIN, Omega Seal"
                            value={linkData.unlocksType}
                            onChange={e => setLinkData({ ...linkData, unlocksType: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#c9b6ff] flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-[#3b2a5a] rounded-xl hover:bg-[#ffd6e8]/40 font-bold border border-[#c9b6ff] transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all cursor-pointer"
                        >
                            <Plus size={14} /> Add Line
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
