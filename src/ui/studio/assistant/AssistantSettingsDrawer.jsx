import React from 'react';
import { Key, CheckCircle2, Zap, Cpu } from 'lucide-react';
import { AVAILABLE_MODELS } from './assistantConstants';

export default function AssistantSettingsDrawer({
    apiKey,
    setApiKey,
    selectedModelId,
    setSelectedModelId,
    savedBadge,
    onSaveSettings
}) {
    return (
        <div className="p-4 bg-[#fbf7ff] border-b border-[#c9b6ff] text-xs space-y-4 animate-in fade-in shadow-inner">
            <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <Key size={13} className="text-[#ff9ec7]" /> OpenRouter & Model Setup
                </span>
                <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 font-mono font-bold">
                    CORS DIRECT
                </span>
            </div>

            {/* Model Selection */}
            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] flex items-center gap-1.5 mb-1.5">
                    <Cpu size={13} className="text-[#ff9ec7]" /> Select Active AI Model
                </label>
                <div className="space-y-1.5">
                    {AVAILABLE_MODELS.map((m) => {
                        const isSelected = selectedModelId === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedModelId(m.id)}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                                    isSelected
                                        ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                        : 'bg-white hover:bg-[#ffd6e8]/30 text-[#3b2a5a] border-[#c9b6ff]'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs flex items-center gap-1.5">
                                        <Zap size={12} className={isSelected ? 'text-[#ff9ec7]' : 'text-amber-500'} />
                                        {m.tag}
                                    </span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                                        isSelected
                                            ? 'bg-white/20 text-[#ffd6e8] border-white/25'
                                            : m.badge.includes('FAST')
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                            : 'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}>
                                        {m.badge}
                                    </span>
                                </div>
                                <p className={`text-[10px] leading-snug ${isSelected ? 'text-[#ffd6e8]/80' : 'text-[#3b2a5a]/70'}`}>
                                    {m.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] block mb-1.5">
                    API Key (sk-or-v1-...)
                </label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                />
                <p className="text-[10px] text-[#3b2a5a]/70 mt-1">
                    Connects directly to OpenRouter in your browser. Stored locally in browser localStorage.
                </p>
            </div>

            <div className="flex items-center justify-between pt-1">
                {savedBadge ? (
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={13} /> Settings Saved
                    </span>
                ) : <div />}
                <button
                    onClick={onSaveSettings}
                    className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2d1f47] text-[#ffd6e8] border border-[#ff9ec7] rounded-xl font-bold transition-all cursor-pointer shadow-sm text-xs"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
}

