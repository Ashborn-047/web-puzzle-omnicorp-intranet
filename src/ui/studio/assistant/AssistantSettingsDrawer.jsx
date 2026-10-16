import React from 'react';
import { ShieldCheck, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { AI_PROVIDERS } from './assistantConstants';

export default function AssistantSettingsDrawer({
    provider,
    onProviderChange,
    apiKey,
    setApiKey,
    customProxy,
    setCustomProxy,
    savedBadge,
    onSaveSettings,
    primaryEnvKey,
    altEnvKey
}) {
    return (
        <div className="p-4 bg-[#fbf7ff] border-b border-[#c9b6ff] text-xs space-y-3.5 animate-in fade-in shadow-inner">
            <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px] uppercase tracking-wider">
                <span>Engine & Credentials</span>
                <span className="text-[10px] text-[#3b2a5a]/60 normal-case font-normal">GitHub Pages Ready</span>
            </div>

            {/* Provider Toggle */}
            <div>
                <label className="text-xs font-semibold text-[#3b2a5a] block mb-1.5">Execution Engine</label>
                <div className="grid grid-cols-3 gap-1.5">
                    <button
                        type="button"
                        onClick={() => onProviderChange(AI_PROVIDERS.BUILTIN)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            provider === AI_PROVIDERS.BUILTIN
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        <ShieldCheck size={14} />
                        <span>Built-in</span>
                        <span className="text-[9px] font-normal opacity-80">No Key Needed</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onProviderChange(AI_PROVIDERS.NVIDIA)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            provider === AI_PROVIDERS.NVIDIA
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        <Zap size={14} />
                        <span>NVIDIA NIM</span>
                        <span className="text-[9px] font-normal opacity-80">Nemotron 120B</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onProviderChange(AI_PROVIDERS.OPENROUTER)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            provider === AI_PROVIDERS.OPENROUTER
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm'
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        <Globe size={14} />
                        <span>OpenRouter</span>
                        <span className="text-[9px] font-normal opacity-80">Browser CORS</span>
                    </button>
                </div>
            </div>

            {/* API Key Input (if not Built-in) */}
            {provider !== AI_PROVIDERS.BUILTIN && (
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#3b2a5a]">
                            {provider === AI_PROVIDERS.OPENROUTER ? 'OpenRouter API Key' : 'NVIDIA NIM API Key'}
                        </label>
                        {provider === AI_PROVIDERS.NVIDIA && (
                            <div className="flex items-center gap-1.5">
                                {primaryEnvKey && (
                                    <button
                                        type="button"
                                        onClick={() => setApiKey(primaryEnvKey)}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                            apiKey === primaryEnvKey 
                                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7]' 
                                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]'
                                        }`}
                                    >
                                        Use Primary
                                    </button>
                                )}
                                {altEnvKey && (
                                    <button
                                        type="button"
                                        onClick={() => setApiKey(altEnvKey)}
                                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                            apiKey === altEnvKey 
                                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7]' 
                                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]'
                                        }`}
                                    >
                                        Use Alternate
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={provider === AI_PROVIDERS.OPENROUTER ? "sk-or-v1-xxxxxxxx" : "nvapi-xxxxxxxxxxxx"}
                        className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                    />
                    <p className="text-[10px] text-[#3b2a5a]/70 mt-1">
                        Saved securely in your browser's local storage.
                    </p>
                </div>
            )}

            {/* Optional Custom Proxy (for NVIDIA on GitHub Pages) */}
            {provider === AI_PROVIDERS.NVIDIA && !import.meta.env.DEV && (
                <div>
                    <label className="text-xs font-semibold text-[#3b2a5a] block mb-1">
                        Custom CORS Proxy URL (Optional)
                    </label>
                    <input
                        type="text"
                        value={customProxy}
                        onChange={(e) => setCustomProxy(e.target.value)}
                        placeholder="https://my-cloudflare-worker.workers.dev/?url="
                        className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                    />
                    <p className="text-[10px] text-[#3b2a5a]/70 mt-1">
                        Note: Direct NVIDIA calls from static GitHub Pages are blocked by browser CORS. If left blank, the app seamlessly auto-falls back to the Built-in Simulation!
                    </p>
                </div>
            )}

            {provider === AI_PROVIDERS.BUILTIN && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] leading-relaxed">
                    💡 <strong>Built-in Mode:</strong> The OmniCorp Neural Engine generates canon characters, PO-4412 clues, and dialogue trees completely in-browser. Zero setup, zero latency, and 100% immune to CORS or network errors.
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
