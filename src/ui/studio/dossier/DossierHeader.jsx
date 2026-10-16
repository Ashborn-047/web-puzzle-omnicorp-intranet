import React from 'react';
import {
    User, ChevronLeft, ChevronRight, ExternalLink, Minimize2,
    Maximize2, Edit3, X, Columns, FileText, Sparkles
} from 'lucide-react';
import { getTierBadge } from '../constants/narrativeDefaults.js';

export default function DossierHeader({
    character,
    characters = [],
    onPrevChar,
    onNextChar,
    onSelectCharacter,
    viewMode,
    setViewMode,
    isFullscreen,
    setIsFullscreen,
    onPopOutWindow,
    onOpenEditForm,
    onClose
}) {
    return (
        <>
            {/* WORKSPACE TOP HEADER */}
            <div className="p-4 sm:p-5 border-b border-[#c9b6ff]/60 bg-gradient-to-r from-[#fbf7ff] via-white to-[#ffd6e8]/25 flex items-center justify-between gap-4 shrink-0 shadow-xs">
                {/* Character Identity & Switcher */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#ffd6e8] to-[#ff9ec7]/40 border border-[#ff9ec7] flex items-center justify-center text-[#3b2a5a] shadow-xs shrink-0">
                        <User size={22} className="text-[#3b2a5a]" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#3b2a5a] tracking-tight truncate">
                                {character.name}
                            </h2>
                            <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f3e8ff] text-[#3b2a5a] border border-[#c9b6ff]">
                                ID: {character.badgeId}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierBadge(character.tier)}`}>
                                {character.tier}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {character.status || 'Active'}
                            </span>
                        </div>
                        <p className="text-xs text-[#3b2a5a]/80 font-medium flex items-center gap-2 truncate">
                            <span>{character.title}</span>
                            <span>•</span>
                            <span className="font-mono text-[#3b2a5a]">{character.dept}</span>
                            <span>•</span>
                            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#c9b6ff]">
                                {character.clearance}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Middle: Quick Character Switcher Bar */}
                {characters.length > 0 && onSelectCharacter && (
                    <div className="hidden md:flex items-center gap-1.5 bg-[#f3e8ff]/90 px-2 py-1 rounded-2xl border border-[#c9b6ff] shrink-0">
                        <button
                            type="button"
                            onClick={onPrevChar}
                            className="p-1 hover:bg-white rounded-lg text-[#3b2a5a] cursor-pointer transition-colors"
                            title="Previous Character"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <select
                            value={character.id}
                            onChange={(e) => {
                                const next = characters.find(c => c.id === e.target.value);
                                if (next) onSelectCharacter(next);
                            }}
                            className="bg-transparent text-xs font-bold text-[#3b2a5a] focus:outline-none cursor-pointer py-1 px-1.5"
                        >
                            {characters.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} ({c.dept})
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={onNextChar}
                            className="p-1 hover:bg-white rounded-lg text-[#3b2a5a] cursor-pointer transition-colors"
                            title="Next Character"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {/* Action buttons on header */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Pop-Out Window Button */}
                    <button
                        type="button"
                        onClick={onPopOutWindow}
                        className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                        title="Open dossier in a dedicated standalone pop-out window"
                    >
                        <ExternalLink size={13} />
                        <span className="hidden xl:inline">Pop Out Window</span>
                    </button>

                    {/* Maximize / Restore Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-xl bg-white hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] transition-colors cursor-pointer shadow-xs"
                        title={isFullscreen ? "Restore Window Size" : "Maximize to Full Screen"}
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    {/* Edit Data in Form */}
                    {onOpenEditForm && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenEditForm(character);
                            }}
                            className="px-2.5 py-1.5 bg-[#f3e8ff] hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                            title="Open full edit form"
                        >
                            <Edit3 size={13} />
                            <span className="hidden sm:inline">Edit Data</span>
                        </button>
                    )}

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-[#ffd6e8] text-[#3b2a5a] transition-colors cursor-pointer border border-transparent hover:border-[#ff9ec7]"
                        title="Close Dossier"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* VIEW CONTROLS & TAB SWITCHER BAR */}
            <div className="px-5 py-2.5 bg-[#f3e8ff]/80 border-b border-[#c9b6ff] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setViewMode('split')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'split'
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-sm'
                                : 'bg-white/80 hover:bg-white text-[#3b2a5a] border border-[#c9b6ff]'
                        }`}
                    >
                        <Columns size={13} /> Side-by-Side Split View
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('dossier')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'dossier'
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-sm'
                                : 'bg-white/80 hover:bg-white text-[#3b2a5a] border border-[#c9b6ff]'
                        }`}
                    >
                        <FileText size={13} /> Dossier Only
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('ai_cowriter')}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            viewMode === 'ai_cowriter'
                                ? 'bg-gradient-to-r from-[#3b2a5a] to-[#51367d] text-[#ffd6e8] shadow-sm'
                                : 'bg-gradient-to-r from-[#ffa8ce]/30 to-[#ffd6e8] hover:from-[#ffa8ce]/50 hover:to-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]'
                        }`}
                    >
                        <Sparkles size={13} className="text-[#ff9ec7]" /> AI Co-Writer Only
                    </button>
                </div>

                <div className="text-[11px] font-mono text-[#3b2a5a]/70 hidden sm:flex items-center gap-3">
                    <span>Project Omega • Iteration 14</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-[#c9b6ff]">
                        {viewMode === 'split' ? 'Dual-Pane Workspace' : viewMode === 'dossier' ? 'Dossier Focus' : 'Co-Writer Focus'}
                    </span>
                </div>
            </div>
        </>
    );
}
