import React from 'react';
import { Key, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AssistantSettingsDrawer({
    apiKey,
    setApiKey,
    nvidiaKey,
    setNvidiaKey,
    savedBadge,
    onSaveSettings
}) {
    return (
        <div className="p-4 bg-[#fbf7ff] border-b border-[#c9b6ff] text-xs space-y-3.5 animate-in fade-in shadow-inner">
            <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <Key size={13} className="text-[#ff9ec7]" /> API Configuration
                </span>
                <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 font-mono font-bold">
                    Nemotron 3 Ultra
                </span>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] block mb-1">
                    OpenRouter API Key (sk-or-v1-...)
                </label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                />
                <p className="text-[10px] text-[#3b2a5a]/70 mt-1">
                    Connects directly to NVIDIA Nemotron 3 Ultra via OpenRouter without CORS restrictions.
                </p>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] flex items-center justify-between mb-1">
                    <span>NVIDIA NIM API Key (Fallback)</span>
                    <span className="text-[10px] font-normal text-[#3b2a5a]/60">nvapi-...</span>
                </label>
                <input
                    type="password"
                    value={nvidiaKey || ''}
                    onChange={(e) => setNvidiaKey && setNvidiaKey(e.target.value)}
                    placeholder="nvapi-xxxxxxxxxxxxxxxx"
                    className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                />
                <p className="text-[10px] text-[#3b2a5a]/70 mt-1 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    Used as fallback if OpenRouter free queues are unavailable.
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
