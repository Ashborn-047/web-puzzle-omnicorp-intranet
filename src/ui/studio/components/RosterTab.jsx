import React from 'react';
import { Search, X, Sparkles, Plus, Users, Edit3, Trash2 } from 'lucide-react';
import { DEPARTMENTS_LIST, ROLES_LIST, getTierBadge } from '../constants/narrativeDefaults.js';

export default function RosterTab({
    characters = [],
    filteredCharacters = [],
    searchQuery,
    setSearchQuery,
    selectedDeptFilter,
    setSelectedDeptFilter,
    selectedRoleFilter,
    setSelectedRoleFilter,
    counts,
    onOpenAddChar,
    onOpenEditChar,
    onDeleteChar,
    onSelectDossierChar,
    onOpenNemotron
}) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            {/* ROSTER TOOLBAR */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search size={16} className="absolute left-3 top-3 text-[#3b2a5a]/50" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, title, or clue..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03),0_1px_0_rgba(255,255,255,1)]"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-2.5 text-[#3b2a5a]/50 hover:text-[#3b2a5a] cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Dept Filter */}
                    <select
                        value={selectedDeptFilter}
                        onChange={e => setSelectedDeptFilter(e.target.value)}
                        className="bg-white border border-[#c9b6ff] rounded-xl px-3 py-2 text-xs text-[#3b2a5a] font-medium focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                    >
                        <option value="ALL">All Departments ({characters.length})</option>
                        {DEPARTMENTS_LIST.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    {/* Tier Filter */}
                    <select
                        value={selectedRoleFilter}
                        onChange={e => setSelectedRoleFilter(e.target.value)}
                        className="bg-white border border-[#c9b6ff] rounded-xl px-3 py-2 text-xs text-[#3b2a5a] font-medium focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                    >
                        <option value="ALL">All Role Tiers</option>
                        {ROLES_LIST.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onOpenNemotron}
                        className="bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-[#c9b6ff] shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                        title="Open AI Co-Writer to brainstorm or create characters"
                    >
                        <Sparkles size={15} className="text-[#3b2a5a]" />
                        <span>AI Co-Writer</span>
                    </button>

                    <button
                        type="button"
                        onClick={onOpenAddChar}
                        className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                        <Plus size={16} /> Add New Character
                    </button>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 shrink-0">
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Protagonist</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.protagonist}</span>
                </div>
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Main Targets</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.main}</span>
                </div>
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Supporting</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.supporting}</span>
                </div>
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Background</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.background}</span>
                </div>
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Deceased / MIA</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.deceased}</span>
                </div>
                <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                    <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Decision Lines</span>
                    <span className="text-base font-bold text-[#3b2a5a]">{counts.lines}</span>
                </div>
            </div>

            {/* ROSTER CARDS GRID */}
            <div className="flex-1 overflow-y-auto pr-1">
                {filteredCharacters.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[#3b2a5a]/70 border border-dashed border-[#c9b6ff] rounded-3xl bg-white/70">
                        <Users size={36} className="mb-2 opacity-40 text-[#c9b6ff]" />
                        <p className="text-sm font-medium">No characters found matching current filters.</p>
                        <button
                            type="button"
                            onClick={onOpenAddChar}
                            className="mt-3 text-xs text-[#3b2a5a] font-bold underline cursor-pointer"
                        >
                            + Add a new character now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                        {filteredCharacters.map(char => (
                            <div
                                key={char.id}
                                onClick={() => onSelectDossierChar(char)}
                                className="bg-white/95 border border-[#c9b6ff] hover:border-[#ff9ec7] rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-[0_6px_20px_rgba(59,42,90,0.06),0_1px_3px_rgba(59,42,90,0.02),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)] hover:shadow-[0_10px_28px_rgba(255,158,199,0.22),inset_0_1.5px_0_rgba(255,255,255,1)] relative cursor-pointer hover:scale-[1.008]"
                                title={`Click to open full dossier & AI story co-writer for ${char.name}`}
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between gap-2 mb-2.5">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[#3b2a5a] text-sm tracking-tight group-hover:text-[#ff4d94] transition-colors">{char.name}</h3>
                                                <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2 py-0.5 rounded-lg border border-[#c9b6ff] shadow-sm font-bold">
                                                    ID: {char.badgeId}
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#3b2a5a]/80 font-bold mt-0.5">{char.title}</p>
                                        </div>

                                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenEditChar(char);
                                                }}
                                                className="p-1.5 bg-[#f3e8ff]/80 hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-lg transition-all border border-[#c9b6ff]/60 hover:border-[#ff9ec7] cursor-pointer shadow-xs"
                                                title="Edit character"
                                            >
                                                <Edit3 size={13} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteChar(char.id, char.name);
                                                }}
                                                className="p-1.5 bg-[#fbf7ff] hover:bg-rose-50 text-[#3b2a5a]/60 hover:text-rose-600 rounded-lg transition-all border border-[#c9b6ff]/50 hover:border-rose-300 cursor-pointer shadow-xs"
                                                title={`Delete ${char.name}`}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dept & Tier Badges */}
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierBadge(char.tier)}`}>
                                            {char.tier}
                                        </span>
                                        <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2.5 py-0.5 rounded-full border border-[#c9b6ff]">
                                            {char.dept}
                                        </span>
                                        <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2.5 py-0.5 rounded-full border border-[#c9b6ff]">
                                            {char.clearance}
                                        </span>
                                    </div>

                                    {/* Clue Held */}
                                    <div className="bg-gradient-to-r from-[#fff5f9] to-[#ffd6e8] p-3 rounded-xl border border-[#ff9ec7]/60 shadow-[0_2px_6px_rgba(255,158,199,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] mb-2.5">
                                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#3b2a5a] block mb-1">
                                            🔑 Clue / Credential Held:
                                        </span>
                                        <p className="text-xs text-[#3b2a5a] leading-relaxed font-sans">{char.clueHeld || 'None specified.'}</p>
                                    </div>

                                    {/* Message / Chat snippet */}
                                    {char.messageSnippet && (
                                        <div className="bg-[#f3e8ff]/60 p-2.5 rounded-xl border border-[#c9b6ff]/60 text-[11px] text-[#3b2a5a]/80 italic mb-2">
                                            "{char.messageSnippet}"
                                        </div>
                                    )}
                                </div>

                                {/* Lore notes & Card Action Footer */}
                                <div className="pt-2.5 border-t border-[#c9b6ff]/50 flex items-center justify-between gap-2 mt-auto">
                                    <div className="text-[10px] text-[#3b2a5a]/70 line-clamp-2 flex-1 group-hover:text-[#3b2a5a] transition-colors">
                                        {char.loreNotes || 'Click to expand full dossier & co-write with AI...'}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectDossierChar(char);
                                            }}
                                            className="px-2.5 py-1 bg-gradient-to-r from-[#ffd6e8] to-[#ffa8ce] hover:from-[#ffc4de] hover:to-[#ff9ec7] text-[#3b2a5a] text-[10px] font-bold rounded-lg border border-[#ff8dbb] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                            title="Inspect full dossier and co-write story with AI"
                                        >
                                            <Sparkles size={11} className="text-[#3b2a5a]" /> Dossier
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenEditChar(char);
                                            }}
                                            className="px-2 py-1 bg-[#f3e8ff]/80 hover:bg-[#ffd6e8] text-[#3b2a5a] text-[10px] font-bold rounded-lg border border-[#c9b6ff]/70 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                            title="Edit character details"
                                        >
                                            <Edit3 size={11} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteChar(char.id, char.name);
                                            }}
                                            className="p-1 text-[#3b2a5a]/40 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                            title={`Delete ${char.name}`}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
