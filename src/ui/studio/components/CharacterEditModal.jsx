import React from 'react';
import { Users, Sparkles, X, Trash2, Save } from 'lucide-react';
import { ROLES_LIST, DEPARTMENTS_LIST, CLEARANCE_LIST } from '../constants/narrativeDefaults.js';

export default function CharacterEditModal({
    isOpen,
    onClose,
    editingChar,
    formData,
    setFormData,
    onSave,
    onDelete,
    onAutoFillWithAI
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-[#3b2a5a]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#c9b6ff] w-full max-w-xl rounded-3xl shadow-[0_20px_50px_rgba(59,42,90,0.2),inset_0_2px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-[#c9b6ff] flex justify-between items-center bg-[#f3e8ff]/50">
                    <h3 className="font-bold text-[#3b2a5a] text-sm flex items-center gap-2">
                        <Users size={16} className="text-[#ff9ec7]" />
                        {editingChar ? `Edit Character: ${editingChar.name}` : 'Add New Character to OmniCorp'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {!editingChar && onAutoFillWithAI && (
                            <button
                                type="button"
                                onClick={onAutoFillWithAI}
                                className="px-3 py-1 bg-gradient-to-r from-[#ffd6e8] to-[#f3e8ff] hover:from-[#ffc4de] hover:to-[#ebd5ff] text-[#3b2a5a] border border-[#ff9ec7] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                                title="Auto-generate a complete employee dossier using AI Co-Writer"
                            >
                                <Sparkles size={13} className="text-[#3b2a5a]" />
                                <span>Auto-Fill with AI</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[#3b2a5a]/60 hover:text-[#3b2a5a] p-1 rounded-lg hover:bg-[#ffd6e8]/40 transition-colors cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSave} className="p-6 overflow-y-auto space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Sarah Kone"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                            />
                        </div>
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Badge ID</label>
                            <input
                                type="text"
                                placeholder="e.g. 7700"
                                value={formData.badgeId}
                                onChange={e => setFormData({ ...formData, badgeId: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 font-mono shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Department</label>
                            <select
                                value={formData.dept}
                                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                            >
                                {DEPARTMENTS_LIST.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Job Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Chief Auditor"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Narrative Tier / Role</label>
                            <select
                                value={formData.tier}
                                onChange={e => setFormData({ ...formData, tier: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                            >
                                {ROLES_LIST.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Clearance Level</label>
                            <select
                                value={formData.clearance}
                                onChange={e => setFormData({ ...formData, clearance: e.target.value })}
                                className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                            >
                                {CLEARANCE_LIST.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                            🔑 Clue / Credential Held
                        </label>
                        <textarea
                            rows={2}
                            placeholder="What information, password, invoice, or residue does this character provide?"
                            value={formData.clueHeld}
                            onChange={e => setFormData({ ...formData, clueHeld: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                            Sample Email / Chat Snippet (Atmosphere & Noise)
                        </label>
                        <textarea
                            rows={2}
                            placeholder="e.g. 'Did anyone leave bulk salt in conference room B?'"
                            value={formData.messageSnippet}
                            onChange={e => setFormData({ ...formData, messageSnippet: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div>
                        <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                            Lore / Character Background
                        </label>
                        <input
                            type="text"
                            placeholder="Brief background notes"
                            value={formData.loreNotes}
                            onChange={e => setFormData({ ...formData, loreNotes: e.target.value })}
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#c9b6ff] flex justify-between items-center gap-2">
                        {editingChar ? (
                            <button
                                type="button"
                                onClick={() => {
                                    const idToDelete = editingChar.id;
                                    const nameToDelete = editingChar.name;
                                    onClose();
                                    onDelete(idToDelete, nameToDelete);
                                }}
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 rounded-xl font-bold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                                title="Delete this character permanently"
                            >
                                <Trash2 size={13} /> Delete Character
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-white text-[#3b2a5a] rounded-xl hover:bg-[#ffd6e8]/40 font-bold border border-[#c9b6ff] transition-all cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all cursor-pointer text-xs"
                            >
                                <Save size={14} /> {editingChar ? 'Save Changes' : 'Create Character'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
