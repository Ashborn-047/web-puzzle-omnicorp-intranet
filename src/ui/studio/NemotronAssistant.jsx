import React, { useState, useEffect, useRef } from 'react';
import { 
    Bot, Send, Sparkles, X, RefreshCw, AlertCircle, 
    ChevronDown, SlidersHorizontal, UserPlus
} from 'lucide-react';
import { generateOmniCorpSimulatedResponse } from './omnicorpSimulator.js';
import {
    AI_PROVIDERS,
    POPULAR_MODELS,
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

    const [provider, setProvider] = useState(AI_PROVIDERS.OPENROUTER);
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('nvidia/nemotron-3-ultra-550b-a55b:free');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! How can I help you today? You can chat with me normally about anything, or ask me to help build characters, lore, and puzzles for your OmniCorp project.'
        }
    ]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [infoMsg] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCharPresets, setShowCharPresets] = useState(false);
    const [savedBadge, setSavedBadge] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Initial load of preferences
    useEffect(() => {
        const savedProvider = localStorage.getItem('omnicorp_ai_provider');
        const savedOpenRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || openrouterEnvKey;
        const savedModel = localStorage.getItem('omnicorp_nemotron_model');

        const activeProvider = savedProvider || AI_PROVIDERS.OPENROUTER;
        setProvider(activeProvider);

        if (savedOpenRouterKey) setApiKey(savedOpenRouterKey);

        if (savedModel && POPULAR_MODELS.some(m => m.id === savedModel)) {
            setSelectedModel(savedModel);
        } else {
            setSelectedModel('nvidia/nemotron-3-ultra-550b-a55b:free');
        }
    }, [isOpen, openrouterEnvKey]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    const handleModelChange = (newModel) => {
        if (!newModel) return;
        if (isLoading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setSelectedModel(newModel);
        localStorage.setItem('omnicorp_nemotron_model', newModel);

        const modelObj = POPULAR_MODELS.find(m => m.id === newModel);
        if (modelObj) {
            setProvider(modelObj.provider);
            localStorage.setItem('omnicorp_ai_provider', modelObj.provider);
        }

        const modelName = modelObj ? modelObj.name : newModel;
        setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚡ Active model switched to **${modelName}**.` }
        ]);
    };

    const handleProviderChange = (newProvider) => {
        setProvider(newProvider);
        localStorage.setItem('omnicorp_ai_provider', newProvider);

        const keyForProvider = localStorage.getItem('omnicorp_openrouter_api_key') || openrouterEnvKey;
        setApiKey(keyForProvider || '');

        const firstMatching = POPULAR_MODELS.find(m => m.provider === newProvider);
        if (firstMatching) {
            setSelectedModel(firstMatching.id);
            localStorage.setItem('omnicorp_nemotron_model', firstMatching.id);
        }
        setErrorMsg('');
    };

    const handleCancelRequest = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setIsLoading(false);
        setErrorMsg('Request cancelled by user.');
    };

    const handleSaveSettings = () => {
        localStorage.setItem('omnicorp_ai_provider', provider);
        localStorage.setItem('omnicorp_openrouter_api_key', apiKey.trim());
        localStorage.setItem('omnicorp_nemotron_model', selectedModel);
        setIsSettingsOpen(false);
        setErrorMsg('');
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
    };

    const streamSimulatedResponse = async (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        const words = fullText.split(' ');
        let accumulated = '';

        for (let i = 0; i < words.length; i++) {
            if (abortControllerRef.current?.signal.aborted) {
                break;
            }
            accumulated += (i === 0 ? '' : ' ') + words[i];
            
            if (i % 2 === 0 || i === words.length - 1) {
                const currentText = accumulated;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: currentText
                    };
                    return updated;
                });
                await new Promise(r => setTimeout(r, 18));
            }
        }
    };

    const handleSendMessage = async (customPrompt) => {
        const textToSend = customPrompt || inputPrompt;
        if (!textToSend.trim()) return;

        if (provider !== AI_PROVIDERS.BUILTIN && !apiKey.trim()) {
            setIsSettingsOpen(true);
            setErrorMsg('Please enter your OpenRouter API key, or switch to the Built-in OmniCorp Engine.');
            return;
        }

        const newMessages = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        setInputPrompt('');
        setIsLoading(true);
        setErrorMsg('');

        abortControllerRef.current = new AbortController();

        // 1. BUILT-IN SIMULATED MODE (100% Reliable on GitHub Pages)
        if (provider === AI_PROVIDERS.BUILTIN) {
            try {
                await new Promise(r => setTimeout(r, 200));
                const simulatedText = generateOmniCorpSimulatedResponse(textToSend, { characters, decisionLines });
                await streamSimulatedResponse(simulatedText);
            } catch (simErr) {
                setErrorMsg('Simulation error: ' + simErr.message);
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
            return;
        }

        // 2. OPENROUTER PRIMARY
        try {
            const contextSummary = `Currently configured: ${characters.length} characters in roster, ${decisionLines.length} decision lines in graph.`;

            const apiMessages = [
                { role: 'system', content: `${OMNICORP_SYSTEM_PROMPT}\n\n[Active Project Context: ${contextSummary}]` },
                ...newMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
            ];

            const payloadBody = JSON.stringify({
                model: selectedModel,
                messages: apiMessages,
                temperature: 0.6,
                max_tokens: 2048,
                stream: true
            });

            const endpoints = ['https://openrouter.ai/api/v1/chat/completions'];
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'OmniCorp Intranet Studio'
            };

            let response = null;
            let lastFetchError = null;

            for (const endpoint of endpoints) {
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers,
                        body: payloadBody,
                        signal: abortControllerRef.current.signal
                    });
                    if (res.ok) {
                        response = res;
                        break;
                    } else {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.message || errData.error?.message || `API HTTP ${res.status}`);
                    }
                } catch (err) {
                    if (err.name === 'AbortError') {
                        throw new Error('Request was cancelled.');
                    }
                    lastFetchError = err;
                }
            }

            if (!response) {
                const modelObj = POPULAR_MODELS.find(m => m.id === selectedModel);
                const errorHelp = lastFetchError?.message || 'Network connection to OpenRouter could not be established. Please verify your OpenRouter API key in Settings (⚙️).';

                setErrorMsg(`⚠️ Could not connect to ${modelObj?.name || 'model'}: ${errorHelp}`);
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⚠️ **Connection Error**: Could not connect to **${modelObj?.name || selectedModel}**.\n\n${errorHelp}\n\n*💡 Tip: Switch to "OmniCorp Neural Architect" in the dropdown for 100% offline, zero-configuration lore generation.*`
                    }
                ]);
                return;
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
                        if (trimmed.startsWith('data:') && !trimmed.includes('[DONE]')) {
                            try {
                                const jsonStr = trimmed.replace(/^data:\s*/, '');
                                const parsed = JSON.parse(jsonStr);
                                const delta = parsed.choices?.[0]?.delta;
                                const contentChunk = delta?.content || '';
                                const reasoningChunk = delta?.reasoning_content || '';

                                if (contentChunk) {
                                    responseText += contentChunk;
                                }
                                if (reasoningChunk) {
                                    reasoningText += reasoningChunk;
                                }

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
                reasoningText = choiceMsg?.reasoning_content || '';
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
                console.warn('API error:', err);
                setErrorMsg(`⚠️ Model error: ${err.message}`);
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⚠️ **Model Error**: ${err.message}`
                    }
                ]);
            }
        } finally {
            setIsLoading(false);
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

    const currentModelObj = POPULAR_MODELS.find(m => m.id === selectedModel) || POPULAR_MODELS[0];

    const getProviderBadge = () => {
        if (provider === AI_PROVIDERS.OPENROUTER) {
            return { label: 'OPENROUTER', color: 'bg-sky-100 text-sky-800 border-sky-300 font-bold' };
        }
        return { label: 'OFFLINE ENGINE', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    };

    const badgeInfo = getProviderBadge();

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
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-xs transition-colors cursor-pointer ${badgeInfo.color}`}
                                title="Click to open Engine & Credentials Settings"
                            >
                                {badgeInfo.label}
                            </button>
                        </div>
                        <p className="text-[11px] text-[#3b2a5a]/70 font-medium truncate max-w-[210px]">
                            {currentModelObj.name}
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
                        title="Configure API Keys & Provider Settings"
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

            {/* Always-Visible Model Selector Bar */}
            <div className="px-4 py-2.5 bg-[#f3e8ff] border-b border-[#c9b6ff] flex items-center justify-between gap-2.5 shrink-0 shadow-xs">
                <div className="flex items-center gap-1.5 text-[#3b2a5a] font-mono text-[11px] font-bold shrink-0">
                    <Sparkles size={13} className="text-[#3b2a5a]" />
                    <span>MODEL:</span>
                </div>
                <div className="relative flex-1">
                    <select
                        value={selectedModel}
                        onChange={(e) => handleModelChange(e.target.value)}
                        className="w-full bg-white hover:bg-slate-50 border border-[#c9b6ff] rounded-xl px-3 py-1.5 text-[#3b2a5a] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] cursor-pointer appearance-none pr-7 shadow-xs"
                    >
                        {POPULAR_MODELS.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-[#3b2a5a]/60 pointer-events-none" />
                </div>
            </div>

            {/* Settings Overlay Drawer */}
            {isSettingsOpen && (
                <AssistantSettingsDrawer
                    provider={provider}
                    onProviderChange={handleProviderChange}
                    apiKey={apiKey}
                    setApiKey={setApiKey}
                    savedBadge={savedBadge}
                    onSaveSettings={handleSaveSettings}
                />
            )}

            {/* Info Banner */}
            {infoMsg && (
                <div className="p-2.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                    <Sparkles size={14} className="shrink-0 mt-0.5 text-amber-600" />
                    <div className="flex-1 font-medium">{infoMsg}</div>
                </div>
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
                        modelTag={currentModelObj.tag}
                        onImportCharacter={handleImportCharacter}
                        onOpenAddModal={onOpenAddModal}
                    />
                ))}

                {isLoading && (
                    <div className="flex flex-col gap-2 py-2 px-1 animate-in fade-in">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-[#3b2a5a] text-xs font-semibold">
                                <RefreshCw size={14} className="animate-spin text-[#3b2a5a] shrink-0" />
                                <span>Formulating via {currentModelObj.tag}...</span>
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
                        placeholder={`Ask ${currentModelObj.tag} to write clues, characters, lore...`}
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
