import React, { useState, useEffect, useRef } from 'react';
import { 
    Bot, Send, Sparkles, X, RefreshCw, AlertCircle, 
    SlidersHorizontal, UserPlus, Zap, Clock
} from 'lucide-react';
import {
    AVAILABLE_MODELS,
    DEFAULT_MODEL_ID,
    OMNICORP_SYSTEM_PROMPT,
    CHARACTER_PRESETS,
    QUICK_INSPIRATION_CHIPS
} from './assistant/assistantConstants';
import AssistantSettingsDrawer from './assistant/AssistantSettingsDrawer';
import AssistantChatBubble from './assistant/AssistantChatBubble';

export default function NemotronAssistant({
    isOpen,
    onClose,
    onAddCharacter,
    onOpenAddModal,
    characters = [],
    decisionLines = []
}) {
    const openrouterEnvKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

    const [apiKey, setApiKey] = useState('');
    const [selectedModelId, setSelectedModelId] = useState(() => {
        const saved = localStorage.getItem('omnicorp_nemotron_model');
        // Default to fast model if not set or if previously set to congested 550b ultra
        if (!saved || saved === 'nvidia/nemotron-3-ultra-550b-a55b:free') {
            localStorage.setItem('omnicorp_nemotron_model', DEFAULT_MODEL_ID);
            return DEFAULT_MODEL_ID;
        }
        return saved;
    });

    const activeModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId) || AVAILABLE_MODELS[0];

    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hello! I am ${activeModel.tag}, your AI co-writer. How can I help you today? You can ask me to draft characters, formulate puzzle clues, critique lore, or chat about anything.`
        }
    ]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamTimer, setStreamTimer] = useState(0);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCharPresets, setShowCharPresets] = useState(false);
    const [savedBadge, setSavedBadge] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const timerIntervalRef = useRef(null);

    // Initial load of OpenRouter key
    useEffect(() => {
        const savedOpenRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || openrouterEnvKey;
        if (savedOpenRouterKey) setApiKey(savedOpenRouterKey);
    }, [isOpen, openrouterEnvKey]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    if (!isOpen) return null;

    const handleModelChange = (newModelId) => {
        setSelectedModelId(newModelId);
        localStorage.setItem('omnicorp_nemotron_model', newModelId);
    };

    const handleCancelRequest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setIsLoading(false);
        setErrorMsg('Request cancelled by user.');
    };

    const handleSwitchModelAndRetry = (fastModelId = DEFAULT_MODEL_ID) => {
        handleCancelRequest();
        handleModelChange(fastModelId);
        // Find last user prompt
        const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
        if (lastUserMsg) {
            setTimeout(() => {
                handleSendMessage(lastUserMsg.content, fastModelId);
            }, 100);
        }
    };

    const handleSaveSettings = () => {
        localStorage.setItem('omnicorp_openrouter_api_key', apiKey.trim());
        localStorage.setItem('omnicorp_nemotron_model', selectedModelId);
        setIsSettingsOpen(false);
        setErrorMsg('');
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
    };

    const handleSendMessage = async (customPrompt, overrideModelId) => {
        const textToSend = customPrompt || inputPrompt;
        if (!textToSend.trim()) return;

        if (!apiKey.trim()) {
            setIsSettingsOpen(true);
            setErrorMsg('Please enter your OpenRouter API key (sk-or-v1-...) in Settings below to begin chatting.');
            return;
        }

        const newMessages = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        setInputPrompt('');
        setIsLoading(true);
        setStreamTimer(0);
        setErrorMsg('');

        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
            setStreamTimer(s => s + 1);
        }, 1000);

        abortControllerRef.current = new AbortController();

        try {
            const contextSummary = `Currently configured: ${characters.length} characters in roster, ${decisionLines.length} decision lines in graph.`;

            const apiMessages = [
                { role: 'system', content: `${OMNICORP_SYSTEM_PROMPT}\n\n[Active Project Context: ${contextSummary}]` },
                ...newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            ];

            const modelToUse = overrideModelId || selectedModelId;

            const payloadBody = JSON.stringify({
                model: modelToUse,
                messages: apiMessages,
                temperature: 0.6,
                max_tokens: 2048,
                stream: true
            });

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'OmniCorp Intranet Studio'
                },
                body: payloadBody,
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || errData.error?.message || `HTTP ${response.status}`);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '', isStreaming: true }]);

            let responseText = '';
            let reasoningText = '';

            if (response.body && response.body.getReader) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let streamBuffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    streamBuffer += decoder.decode(value, { stream: true });
                    const lines = streamBuffer.split('\n');
                    streamBuffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        // Ignore OpenRouter keep-alive SSE comments (: OPENROUTER PROCESSING)
                        if (trimmed.startsWith(':')) {
                            continue;
                        }

                        if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
                            try {
                                const jsonStr = trimmed.replace(/^data:\s*/, '');
                                const parsed = JSON.parse(jsonStr);
                                const delta = parsed.choices?.[0]?.delta;
                                const contentChunk = delta?.content || '';
                                const reasoningChunk = delta?.reasoning || delta?.reasoning_content || '';

                                if (contentChunk) responseText += contentChunk;
                                if (reasoningChunk) reasoningText += reasoningChunk;

                                const cleanContent = responseText
                                    .replace(/<\|close\|>message/g, '')
                                    .replace(/<think>[\s\S]*?<\/think>/g, '');
                                const cleanReasoning = reasoningText
                                    .replace(/<\|close\|>message/g, '')
                                    .replace(/<think>[\s\S]*?<\/think>/g, '');

                                setMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        role: 'assistant',
                                        content: cleanContent,
                                        reasoning: cleanReasoning,
                                        isStreaming: true
                                    };
                                    return updated;
                                });
                            } catch {
                                // Ignore unparseable SSE line fragments
                            }
                        }
                    }
                }
            } else {
                const data = await response.json();
                const choiceMsg = data.choices?.[0]?.message;
                responseText = choiceMsg?.content || '';
                reasoningText = choiceMsg?.reasoning || choiceMsg?.reasoning_content || '';
            }

            const finalContent = responseText
                .replace(/<\|close\|>message/g, '')
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .trim();
            const finalReasoning = reasoningText
                .replace(/<\|close\|>message/g, '')
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .trim();

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: finalContent || finalReasoning || 'No response returned from model.',
                    reasoning: finalReasoning,
                    isStreaming: false
                };
                return updated;
            });
        } catch (err) {
            if (err.name !== 'AbortError' && err.message !== 'Request was cancelled.') {
                console.warn('OpenRouter API error:', err);
                setErrorMsg(`⚠️ OpenRouter error: ${err.message}`);
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⚠️ **OpenRouter Error**: ${err.message}. Please verify your API key in Settings (⚙️).`
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            abortControllerRef.current = null;
        }
    };


    const handleImportCharacter = (charObj) => {
        if (!onAddCharacter) return;
        const newChar = {
            id: `char_${Math.random().toString(36).substring(2, 9)}`,
            ...charObj
        };
        onAddCharacter(newChar);
        setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `✅ Character **${newChar.name}** [Badge: ${newChar.badgeId}] added to your studio roster!` }
        ]);
    };

    return (
        <aside className="w-[450px] xl:w-[490px] shrink-0 border-l border-[#c9b6ff] bg-white flex flex-col h-full overflow-hidden text-[#3b2a5a] shadow-[-6px_0_24px_rgba(59,42,90,0.06)] animate-in slide-in-from-right duration-300 z-30">
            {/* Aside Header */}
            <div className="px-5 py-3.5 border-b border-[#c9b6ff]/60 bg-[#fbf7ff] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-[#ffd6e8] to-[#ff9ec7]/40 border border-[#ff9ec7] flex items-center justify-center text-[#3b2a5a] shadow-[0_2px_6px_rgba(255,158,199,0.3)]">
                        <Bot size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#3b2a5a] tracking-tight">AI Co-Writer</h3>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-xs bg-sky-100 text-sky-800 border-sky-300">
                                OPENROUTER
                            </span>
                        </div>
                        <p className="text-[11px] text-[#3b2a5a]/70 font-medium truncate max-w-[210px]">
                            {activeModel.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer border ${
                            isSettingsOpen 
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7]' 
                                : 'hover:bg-[#ffd6e8]/50 text-[#3b2a5a] border-transparent'
                        }`}
                        title="Configure OpenRouter API Key & Models"
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-[#ffd6e8]/50 text-[#3b2a5a] transition-colors cursor-pointer"
                        title="Close AI Panel"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Model Info & Quick Switch Bar */}
            <div className="px-4 py-2.5 bg-[#f3e8ff] border-b border-[#c9b6ff] flex items-center justify-between gap-2 shrink-0 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#3b2a5a] font-mono text-[11px] font-bold">
                    <Sparkles size={13} className="text-[#3b2a5a]" />
                    <span>MODEL:</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <select
                        value={selectedModelId}
                        onChange={(e) => handleModelChange(e.target.value)}
                        disabled={isLoading}
                        className="bg-white border border-[#c9b6ff] rounded-xl px-2.5 py-1 text-[#3b2a5a] text-xs font-bold shadow-xs focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] cursor-pointer disabled:opacity-50"
                        title="Quick-switch active model"
                    >
                        {AVAILABLE_MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.tag} ({m.badge})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Settings Overlay Drawer */}
            {isSettingsOpen && (
                <AssistantSettingsDrawer
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    selectedModelId={selectedModelId}
                    setSelectedModelId={handleModelChange}
                    savedBadge={savedBadge}
                    onSaveSettings={handleSaveSettings}
                />
            )}

            {/* Error Banner */}
            {errorMsg && (
                <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                    <div className="flex-1 font-medium">{errorMsg}</div>
                </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed bg-[#fbf7ff]">
                {messages.map((m, idx) => (
                    <AssistantChatBubble
                        key={idx}
                        message={m}
                        modelTag={activeModel.tag}
                        onImportCharacter={handleImportCharacter}
                        onOpenAddModal={onOpenAddModal}
                    />
                ))}

                {isLoading && (
                    <div className="flex flex-col gap-2 py-2 px-1 animate-in fade-in">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[#3b2a5a] text-xs font-semibold">
                                <RefreshCw size={14} className="animate-spin text-[#3b2a5a] shrink-0" />
                                <span>{activeModel.tag} is streaming response ({streamTimer}s)...</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCancelRequest}
                                className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer"
                                title="Cancel current request"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* OpenRouter Free Tier Congestion / Queue Helper */}
                        {streamTimer >= 8 && !messages[messages.length - 1]?.content && !messages[messages.length - 1]?.reasoning && (
                            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px] space-y-1.5 animate-in fade-in">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold flex items-center gap-1.5">
                                        <Clock size={12} className="text-amber-600" /> OpenRouter queue wait ({streamTimer}s)...
                                    </span>
                                </div>
                                <div className="text-[10px] text-amber-800 flex items-center justify-between gap-2 pt-1 border-t border-amber-200">
                                    <span>Takes too long? Switch to Fast Model:</span>
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchModelAndRetry(DEFAULT_MODEL_ID)}
                                        className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-lg cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                                    >
                                        ⚡ Fast Nano (~2s)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Inspiration Chips & Character Drawer */}
            {showCharPresets && (
                <div className="p-3 bg-[#f3e8ff] border-t border-[#c9b6ff] text-xs space-y-2 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px]">
                        <span className="flex items-center gap-1.5">
                            <UserPlus size={13} className="text-[#3b2a5a]" /> Choose Character Concept:
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowCharPresets(false)}
                            className="text-[#3b2a5a]/60 hover:text-[#3b2a5a] p-0.5 rounded-md cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {CHARACTER_PRESETS.map((preset, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setShowCharPresets(false);
                                    handleSendMessage(preset.prompt);
                                }}
                                className="p-2 bg-white hover:bg-[#ffd6e8]/60 border border-[#c9b6ff] rounded-xl text-left text-[11px] font-bold text-[#3b2a5a] transition-all cursor-pointer shadow-xs active:scale-98"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-4 py-2 border-t border-[#c9b6ff] bg-[#fbf7ff] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <button
                    type="button"
                    onClick={() => setShowCharPresets(!showCharPresets)}
                    className="text-[10px] bg-gradient-to-r from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] border border-[#ff8dbb] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-bold shadow-xs flex items-center gap-1 shrink-0 active:scale-95"
                    title="Generate a new character with AI"
                >
                    <UserPlus size={12} />
                    <span>+ Draft Character</span>
                </button>

                <span className="text-[10px] text-[#3b2a5a]/50 font-mono font-bold shrink-0">|</span>

                {QUICK_INSPIRATION_CHIPS.map((chip, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSendMessage(chip.slice(2))}
                        disabled={isLoading}
                        className="text-[10px] bg-white hover:bg-[#ffd6e8]/60 text-[#3b2a5a] border border-[#c9b6ff] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 font-bold shadow-xs"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-[#c9b6ff] bg-white shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        placeholder={`Ask ${activeModel.tag} to write clues, characters, lore...`}
                        disabled={isLoading}
                        className="flex-1 bg-[#fbf7ff] border border-[#c9b6ff] rounded-xl px-3.5 py-2 text-xs text-[#3b2a5a] placeholder-[#3b2a5a]/45 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] font-medium shadow-xs"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputPrompt.trim()}
                        className="px-3.5 py-2 bg-[#3b2a5a] hover:bg-[#2d1f47] disabled:opacity-40 text-[#ffd6e8] border border-[#ff9ec7] rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm"
                        title="Send message"
                    >
                        <Send size={15} />
                    </button>
                </form>
            </div>
        </aside>
    );
}
