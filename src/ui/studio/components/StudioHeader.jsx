import React from 'react';
import {
    Activity, Users, CornerDownRight, Network, FileText,
    AlertTriangle, GitBranch, Bot, RotateCcw, Lock, Building2, X
} from 'lucide-react';

export default function StudioHeader({
    activeStudioTab,
    setActiveStudioTab,
    counts,
    isSyncModalOpen,
    setIsSyncModalOpen,
    isNemotronOpen,
    setIsNemotronOpen,
    onResetToCanon,
    onLockStudio,
    isStandalone,
    onClose
}) {
    return (
        <header className="px-6 py-4 border-b border-[#c9b6ff] bg-white/95 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-[0_4px_20px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] flex items-center justify-center text-[#3b2a5a] shadow-[0_4px_12px_rgba(255,158,199,0.4),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-1.5px_0_rgba(215,100,145,0.3)] border border-[#ff8dbb]">
                    <Activity size={20} className="text-[#3b2a5a]" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold font-serif text-[#3b2a5a] tracking-tight">Narrative Studio</h1>
                        <span className="text-[10px] bg-[#ffd6e8] text-[#3b2a5a] px-2.5 py-0.5 rounded-full font-mono border border-[#ff9ec7] font-bold shadow-sm">DEV STUDIO</span>
                    </div>
                    <p className="text-xs text-[#3b2a5a]/70">Design OmniCorp employees, assign narrative tiers, and connect investigation decision lines</p>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                {/* View Switcher Tabs */}
                <div className="bg-[#e9dcfa] p-1.5 rounded-2xl border border-[#c9b6ff] shadow-[inset_0_1.5px_3px_rgba(59,42,90,0.05)] flex text-xs">
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('roster')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'roster' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                    >
                        <Users size={14} /> Character Roster ({counts.total})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('decision_tree')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'decision_tree' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                    >
                        <CornerDownRight size={14} /> Decision Lines ({counts.lines})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('graph')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'graph' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                    >
                        <Network size={14} /> Obsidian Graph Map
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('export')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'export' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                    >
                        <FileText size={14} /> JSON Export
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveStudioTab('plot_holes')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeStudioTab === 'plot_holes' ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#ff9ec7]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                    >
                        <AlertTriangle size={14} className={activeStudioTab === 'plot_holes' ? 'text-[#ff9ec7]' : 'text-[#3b2a5a]'} />
                        <span>Plot Holes & Continuity</span>
                    </button>
                </div>

                {/* Sync & AI Actions */}
                <button
                    type="button"
                    onClick={() => setIsSyncModalOpen(!isSyncModalOpen)}
                    className="px-3 py-1.5 bg-gradient-to-r from-indigo-900 to-indigo-950 hover:from-indigo-800 hover:to-indigo-900 text-indigo-100 rounded-xl border border-indigo-400/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Sync with GitHub repository & local workspace"
                >
                    <GitBranch size={14} className="text-indigo-300" /> Cloud Sync
                </button>

                <button
                    type="button"
                    onClick={() => setIsNemotronOpen(!isNemotronOpen)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isNemotronOpen
                            ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-[0_2px_8px_rgba(59,42,90,0.15)]'
                            : 'bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.04)]'
                    }`}
                    title="Toggle AI Co-Writer side panel"
                >
                    <Bot size={14} className={isNemotronOpen ? 'text-[#ff9ec7]' : 'text-[#3b2a5a]'} />
                    <span>AI Co-Writer</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]">NIM</span>
                </button>

                <button
                    type="button"
                    onClick={onResetToCanon}
                    title="Reset to Canon Defaults"
                    className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                    <RotateCcw size={14} /> Reset
                </button>

                <button
                    type="button"
                    onClick={onLockStudio}
                    className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Lock Studio"
                >
                    <Lock size={13} /> Lock
                </button>

                {isStandalone ? (
                    <a
                        href="./index.html"
                        className="px-3 py-1.5 bg-[#c9b6ff]/30 hover:bg-[#c9b6ff]/50 text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ml-0.5"
                    >
                        <Building2 size={14} /> Intranet
                    </a>
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-[#ffd6e8]/50 text-[#3b2a5a] rounded-xl transition-colors ml-0.5 cursor-pointer"
                        title="Close Studio"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </header>
    );
}
