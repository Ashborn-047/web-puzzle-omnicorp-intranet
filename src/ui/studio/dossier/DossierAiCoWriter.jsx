import React from 'react';
import {
    Sparkles, Key, X, FileText, MessageSquare, AlertTriangle,
    CheckCircle2, Copy, RefreshCw, Wand2, Send
} from 'lucide-react';

export default function DossierAiCoWriter({
    character,
    showKeyConfig,
    setShowKeyConfig,
    openRouterKeyInput,
    setOpenRouterKeyInput,
    onSaveOpenRouterKey,
    onSendMessage,
    isAiGenerating,
    appliedSuccess,
    setAppliedSuccess,
    chatMessages,
    aiError,
    setAiError,
    chatInput,
    setChatInput,
    messagesEndRef,
    onApplyTextToLore,
    onApplyTextToQuote,
    onApplyTextToClue
}) {
    return (
        <div className="flex flex-col h-full min-h-0 space-y-3">
            {/* Collaborative Banner */}
            <div className="bg-gradient-to-r from-[#3b2a5a] via-[#462d6c] to-[#5a388b] p-3.5 sm:p-4 rounded-2xl text-white shadow-sm space-y-2.5 shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Sparkles size={15} className="text-[#ff9ec7]" />
                        <h3 className="text-sm font-bold font-serif tracking-wide text-white">
                            Collaborative Narrative Partner: {character.name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowKeyConfig(!showKeyConfig)}
                            className="text-[10px] font-mono bg-white/20 hover:bg-white/30 text-[#ffd6e8] px-2.5 py-1 rounded-full border border-white/25 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Configure OpenRouter API Key"
                        >
                            <Key size={11} className="text-[#ff9ec7]" />
                            <span>{openRouterKeyInput ? '🔑 Key Active' : '⚠️ Set OpenRouter Key'}</span>
                        </button>
                        <span className="text-[10px] font-mono bg-white/20 text-[#ffd6e8] px-2 py-0.5 rounded-full border border-white/20 hidden sm:inline">
                            CORS Ready
                        </span>
                    </div>
                </div>

                {/* Collapsible API Key Drawer */}
                {showKeyConfig && (
                    <div className="p-3 bg-black/40 border border-[#ff9ec7]/40 rounded-xl space-y-2 text-xs text-white animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5 text-[#ffd6e8]">
                                <Key size={13} className="text-[#ff9ec7]" /> OpenRouter API Key Setup
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setShowKeyConfig(false)} 
                                className="text-white/60 hover:text-white cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-[11px] text-[#ffd6e8]/80 leading-relaxed">
                            Paste your OpenRouter key (<code>sk-or-v1-...</code>) to connect live Nemotron models directly in your browser without CORS blocks.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                value={openRouterKeyInput}
                                onChange={(e) => setOpenRouterKeyInput(e.target.value)}
                                placeholder="sk-or-v1-..."
                                className="flex-1 px-3 py-1.5 bg-black/60 border border-[#c9b6ff]/50 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#ff9ec7]"
                            />
                            <button
                                type="button"
                                onClick={() => onSaveOpenRouterKey(openRouterKeyInput)}
                                className="px-3.5 py-1.5 bg-[#ff9ec7] hover:bg-[#ff85b7] text-[#3b2a5a] font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                )}

                {/* Quick Action Prompt Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/15">
                    <button
                        type="button"
                        onClick={() => onSendMessage(`Run a comprehensive narrative audit on ${character.name} (${character.title}, ${character.dept}, Clearance ${character.clearance}). Check for any missing details or lore inconsistencies, propose 2 contrasting story options (Option A vs Option B), and prompt me with 3 creative questions to check.`)}
                        disabled={isAiGenerating}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#ff9ec7] to-[#ffd6e8] hover:from-[#ff8cbe] hover:to-[#ffc4de] text-[#3b2a5a] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Audit character details and prompt user with creative choices"
                    >
                        <Sparkles size={13} className="text-[#3b2a5a]" />
                        <span>🔍 Audit & Prompt Me</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onSendMessage(`Deepen ${character.name}'s secret backstory. Describe what anomaly they discovered in ${character.dept}, their psychological dread, and how it ties into Project Omega.`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <FileText size={12} className="text-[#ff9ec7]" /> Deepen Backstory
                    </button>
                    <button
                        type="button"
                        onClick={() => onSendMessage(`Draft an authentic in-character memo or decrypted chat log from ${character.name} revealing suspicion about PO-4412.`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <MessageSquare size={12} className="text-[#ff9ec7]" /> Draft Voice Log
                    </button>
                    <button
                        type="button"
                        onClick={() => onSendMessage(`Design a forensic puzzle clue for ${character.name} to hold (e.g. an unredacted financial PO-4412 slip, encrypted memory stick, or terminal override code).`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <Key size={12} className="text-[#ff9ec7]" /> Formulate Clue
                    </button>
                    <button
                        type="button"
                        onClick={() => onSendMessage(`Draft a chilling HR deprovisioning notice from Patricia Vance warning ${character.name} to cease unauthorized inquiries immediately.`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <AlertTriangle size={12} className="text-[#ff9ec7]" /> HR Threat
                    </button>
                </div>
            </div>

            {/* Notification banner */}
            {appliedSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in shrink-0">
                    <CheckCircle2 size={14} />
                    <span>{appliedSuccess}</span>
                </div>
            )}

            {/* Collaborative Chat Messages */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
                {chatMessages.map((msg, idx) => (
                    <div 
                        key={idx}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                    >
                        <span className="text-[10px] font-mono font-bold text-[#3b2a5a]/60 px-1">
                            {msg.role === 'user' ? 'Architect (You)' : 'AI Co-Writer'}
                        </span>

                        <div 
                            className={`rounded-2xl p-4 max-w-[94%] text-xs sm:text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user'
                                    ? 'bg-[#3b2a5a] text-[#ffd6e8] border border-[#ff9ec7] rounded-br-sm'
                                    : 'bg-white border border-[#c9b6ff] text-[#3b2a5a] rounded-bl-sm space-y-3'
                            }`}
                        >
                            {/* Reasoning if available */}
                            {msg.reasoning && (
                                <details className="text-[11px] text-[#3b2a5a]/70 bg-[#f3e8ff]/60 border border-[#c9b6ff]/60 rounded-xl p-2 cursor-pointer group">
                                    <summary className="font-mono font-bold text-[10px] text-[#3b2a5a]/80 select-none flex items-center gap-1.5 list-none">
                                        <span>💭</span>
                                        <span>Narrative Thinking</span>
                                    </summary>
                                    <div className="mt-1.5 pt-1.5 border-t border-[#c9b6ff]/40 text-[#3b2a5a]/80 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                                        {msg.reasoning}
                                    </div>
                                </details>
                            )}

                            <div className="whitespace-pre-wrap">
                                {msg.content || (msg.isStreaming ? 'Formulating proposal...' : '')}
                            </div>

                            {/* 1-Click Action Buttons for Assistant Proposals */}
                            {msg.role === 'assistant' && msg.content && !msg.isStreaming && idx > 0 && (
                                <div className="pt-2.5 border-t border-[#c9b6ff]/50 flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => onApplyTextToLore(msg.content, 'replace')}
                                        className="px-2.5 py-1 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#ff8dbb] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Save this narrative into the character's backstory"
                                    >
                                        <FileText size={11} /> Apply as Backstory
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onApplyTextToLore(msg.content, 'append')}
                                        className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#c9b6ff] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Append to existing backstory"
                                    >
                                        ➕ Append
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onApplyTextToQuote(msg.content)}
                                        className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#c9b6ff] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Extract quote and apply to voice snippet"
                                    >
                                        <MessageSquare size={11} /> Apply as Quote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onApplyTextToClue(msg.content)}
                                        className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#c9b6ff] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Set as clue held"
                                    >
                                        <Key size={11} /> Apply as Clue
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(msg.content);
                                            setAppliedSuccess('Copied text to clipboard!');
                                            setTimeout(() => setAppliedSuccess(''), 2000);
                                        }}
                                        className="p-1 text-[#3b2a5a]/60 hover:text-[#3b2a5a] ml-auto cursor-pointer"
                                        title="Copy text"
                                    >
                                        <Copy size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Collaborative Refinement Quick Toggles */}
                            {msg.role === 'assistant' && msg.content && !msg.isStreaming && idx > 0 && (
                                <div className="pt-2 border-t border-dashed border-[#c9b6ff]/40 flex flex-wrap items-center gap-1.5 text-[10px]">
                                    <span className="font-mono font-bold text-[#3b2a5a]/70 flex items-center gap-1">
                                        <RefreshCw size={10} className="text-[#ff9ec7]" /> Ask to Change:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onSendMessage(`Change the tone of this description for ${character.name}: make them sound significantly more paranoid, sleep-deprived, and suspicious of OmniCorp surveillance.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🎭 More Paranoid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSendMessage(`Change the tone for ${character.name}: rewrite this in sterile, detached OmniCorp corporate jargon and compliant doublespeak.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🏢 Sterile Corporate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSendMessage(`Introduce an escalating dispute between ${character.name} and Sarah Kone over unredacted PO-4412 shipping manifests.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        ⚡ Dispute Sarah Kone
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSendMessage(`Change the clue to an encrypted USB flash drive hidden inside ${character.name}'s ventilation shaft.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🔑 Switch Clue to USB
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onSendMessage(`Prompt me with 3 creative questions about ${character.name}'s secrets, relationships, and fate so we can refine them together.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        ❓ Prompt Me 3 Questions
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Collaborative Interactive Suggestions / Follow-ups */}
                        {msg.suggestions && msg.suggestions.length > 0 && !isAiGenerating && idx === chatMessages.length - 1 && (
                            <div className="pt-2 pl-2 space-y-1.5 w-full">
                                <span className="text-[10px] font-mono font-bold text-[#3b2a5a]/70 flex items-center gap-1">
                                    <Wand2 size={11} className="text-[#ff9ec7]" /> Collaborative Suggestions:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {msg.suggestions.map((sugg, sIdx) => (
                                        <button
                                            key={sIdx}
                                            type="button"
                                            onClick={() => onSendMessage(sugg)}
                                            className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/60 text-[#3b2a5a] text-[10px] font-bold rounded-lg border border-[#c9b6ff] transition-all flex items-center gap-1 cursor-pointer shadow-xs active:scale-95 text-left"
                                        >
                                            <span>👉 {sugg}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isAiGenerating && (
                    <div className="flex items-center gap-2 p-3 text-xs text-[#3b2a5a] font-bold bg-white/80 rounded-xl border border-[#c9b6ff]/60 animate-in fade-in">
                        <RefreshCw size={13} className="animate-spin text-[#ff9ec7]" />
                        <span>AI is formulating collaborative story options...</span>
                    </div>
                )}
                {aiError && (
                    <div className="flex items-center gap-2 p-2.5 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span className="flex-1">{aiError}</span>
                        <button type="button" onClick={() => setAiError('')} className="p-0.5 hover:bg-rose-100 rounded text-rose-500 cursor-pointer">
                            <X size={12} />
                        </button>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="pt-2 border-t border-[#c9b6ff]/60 space-y-1.5 shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isAiGenerating && onSendMessage()}
                        placeholder={`Tell AI what to change, refine, or ask for ${character.name}...`}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-[#c9b6ff] rounded-xl text-xs sm:text-sm text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] shadow-xs"
                        disabled={isAiGenerating}
                    />
                    <button
                        type="button"
                        onClick={() => onSendMessage()}
                        disabled={isAiGenerating || !chatInput.trim()}
                        className="px-4 py-2.5 bg-[#3b2a5a] hover:bg-[#2c1e44] text-[#ffd6e8] rounded-xl font-bold text-xs border border-[#ff9ec7] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                    >
                        {isAiGenerating ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                        <span>Send</span>
                    </button>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#3b2a5a]/60 px-1 font-mono">
                    <span>🤝 Collaborative Partner Mode Active (OpenRouter)</span>
                    <span>Press Enter to send</span>
                </div>
            </div>
        </div>
    );
}
