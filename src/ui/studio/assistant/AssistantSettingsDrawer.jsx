import React from 'react';
import { Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AI_PROVIDERS } from './assistantConstants';

export default function AssistantSettingsDrawer({
    provider,
    onProviderChange,
    apiKey,
    setApiKey,
    savedBadge,
    onSaveSettings
}) {
    return (
        <div className="p-4 bg-[#fbf7ff] border-b border-[#c9b6ff] text-xs space-y-3.5 animate-in fade-in shadow-inner">
            <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px] uppercase tracking-wider">
                <span>Engine & Credentials</span>
                <span className="text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300 font-mono font-bold">
                    OpenRouter Active
                </span>
            </div>

            {/* Provider Toggle: OpenRouter (Primary) vs Built-in (Offline) */}
            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] block mb-1.5">Execution Engine</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => onProviderChange(AI_PROVIDERS.OPENROUTER)}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            provider === AI_PROVIDERS.OPENROUTER
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        <Globe size={15} className={provider === AI_PROVIDERS.OPENROUTER ? 'text-[#ff9ec7]' : 'text-sky-600'} />
                        <span>OpenRouter (Primary)</span>
                        <span className="text-[9px] font-normal opacity-80">NVIDIA Nemotron 3 Ultra</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onProviderChange(AI_PROVIDERS.BUILTIN)}
                        className={`p-2.5 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            provider === AI_PROVIDERS.BUILTIN
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        <ShieldCheck size={15} className={provider === AI_PROVIDERS.BUILTIN ? 'text-[#ff9ec7]' : 'text-emerald-600'} />
                        <span>Built-in (Offline)</span>
                        <span className="text-[9px] font-normal opacity-80">Zero-Config Simulation</span>
                    </button>
                </div>
            </div>

            {/* API Key Input (if OpenRouter) */}
            {provider === AI_PROVIDERS.OPENROUTER && (
                <div>
                    <label className="text-xs font-semibold text-[#3b2a5a] block mb-1.5">
                        OpenRouter API Key
                    </label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-or-v1-xxxxxxxxxxxxxxxx"
                        className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                    />
                    <p className="text-[10px] text-[#3b2a5a]/70 mt-1">
                        Connects live NVIDIA Nemotron 3 Ultra directly in your browser without CORS blocks. Saved locally in your browser.
                    </p>
                </div>
            )}

            {provider === AI_PROVIDERS.BUILTIN && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
                    💡 <strong>Built-in Mode:</strong> The OmniCorp Neural Engine runs 100% offline in-browser. Zero setup, zero keys needed, and immune to network drops.
                </div>
            )}

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
