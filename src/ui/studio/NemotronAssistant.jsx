import React, { useState, useEffect, useRef } from 'react';
import { 
    Bot, Send, Sparkles, Plus, X, RefreshCw, AlertCircle, 
    ChevronDown, CheckCircle2, SlidersHorizontal, Globe, Zap, ShieldCheck,
    UserPlus, Edit3
} from 'lucide-react';
import { generateOmniCorpSimulatedResponse } from './omnicorpSimulator.js';

const AI_PROVIDERS = {
    BUILTIN: 'builtin',
    NVIDIA: 'nvidia',
    OPENROUTER: 'openrouter'
};

const POPULAR_MODELS = [
    // Built-in OmniCorp Lore Engine (Zero configuration, 100% reliable offline)
    { 
        id: 'builtin/omnicorp-neural', 
        name: 'OmniCorp Neural Architect (Offline • 100% Reliable)', 
        tag: 'OmniCorp Neural',
        provider: AI_PROVIDERS.BUILTIN 
    },
    // NVIDIA NIM Models (Requires running locally via npm run dev or custom proxy)
    { 
        id: 'nvidia/nemotron-3-super-120b-a12b', 
        name: 'NVIDIA Nemotron 3 120B (Local Dev Server / Proxy)', 
        tag: 'Nemotron 120B (NIM)',
        provider: AI_PROVIDERS.NVIDIA 
    },
    { 
        id: 'deepseek-ai/deepseek-v4.1-flash', 
        name: 'NVIDIA DeepSeek v4.1 Flash (Local Dev Server)', 
        tag: 'DeepSeek v4.1',
        provider: AI_PROVIDERS.NVIDIA 
    },
    { 
        id: 'moonshotai/kimi-k3', 
        name: 'Moonshot Kimi k3 (Local Dev Server)', 
        tag: 'Kimi k3',
        provider: AI_PROVIDERS.NVIDIA 
    },
    // OpenRouter Models (Full native browser CORS support on GitHub Pages)
    { 
        id: 'nvidia/nemotron-3-ultra-550b-a55b:free', 
        name: 'NVIDIA Nemotron 3 Ultra Free (OpenRouter • 1M Context)', 
        tag: 'Nemotron Ultra Free',
        provider: AI_PROVIDERS.OPENROUTER 
    },
    { 
        id: 'nvidia/nemotron-3-super-120b-a12b:free', 
        name: 'NVIDIA Nemotron 3 120B Free (OpenRouter • Web CORS Ready)', 
        tag: 'Nemotron 120B (Web)',
        provider: AI_PROVIDERS.OPENROUTER 
    },
    { 
        id: 'meta-llama/llama-3.2-3b-instruct:free', 
        name: 'Meta Llama 3.2 3B Free (OpenRouter • Web CORS Ready)', 
        tag: 'Llama 3.2 Free',
        provider: AI_PROVIDERS.OPENROUTER 
    },
    { 
        id: 'deepseek/deepseek-r1:free', 
        name: 'DeepSeek R1 Free (OpenRouter • Web CORS Ready)', 
        tag: 'DeepSeek R1 Free',
        provider: AI_PROVIDERS.OPENROUTER 
    }
];

const OMNICORP_SYSTEM_PROMPT = `You are a helpful, conversational, and versatile AI assistant. 
Communicate naturally, warmly, and helpfully just like a general AI chat interface. 
- If the user greets you (e.g. "hello", "hi", "how are you"), reply warmly and naturally as an AI chat partner and ask how you can help them today.
- You can converse about anything, answer general knowledge questions, discuss ideas, write stories or code, and brainstorm.
- You are also knowledgeable about the user's project, "OmniCorp Intranet" (a cosmic horror mystery ARG game about an artificial loop trapped inside Project Omega).
- If the user asks specifically about game lore, characters (Sarah Kone, David Bowman, Bill Lumbergh, Patricia Vance, Ellen Ripley, Subject 882), or puzzle clues, provide rich lore insights.
- If the user explicitly asks to generate or create a new employee/character for the roster, include a clean JSON code block with fields: name, badgeId, dept, title, tier, clearance, status, clueHeld, messageSnippet, loreNotes so the studio can import it.`;

const CHARACTER_PRESETS = [
    { label: '🧪 Sector 7 Bio-Tech', prompt: 'Create a Sector 7 Bio-Containment Specialist who discovered living matter in coolant pipes' },
    { label: '💻 IT Rogue SysAdmin', prompt: 'Create a rogue IT systems administrator who noticed terminal memory residues across loop cycles' },
    { label: '📊 Finance Auditor', prompt: 'Create a junior financial auditor investigating unmapped offshore wire transfers for PO-4412' },
    { label: '📋 HR Deprovisioning Officer', prompt: 'Create an HR compliance liaison who processed paperwork for missing employee #882' },
    { label: '🚚 Janitorial Slurry Handler', prompt: 'Create a night-shift maintenance courier who transported sealed cryo-drums to Sub-level 3' },
    { label: '🎲 Surprise Employee', prompt: 'Create an unexpected corporate employee with a unique mystery clue for OmniCorp Intranet' }
];

export default function NemotronAssistant({
    isOpen,
    onClose,
    onAddCharacter,
    onOpenAddModal,
    characters = [],
    decisionLines = []
}) {
    const primaryEnvKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
    const altEnvKey = import.meta.env.VITE_NVIDIA_API_KEY_ALT || '';
    const openrouterEnvKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

    const [provider, setProvider] = useState(AI_PROVIDERS.OPENROUTER);
    const [apiKey, setApiKey] = useState('');
    const [customProxy, setCustomProxy] = useState('');
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
    const [infoMsg, setInfoMsg] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showCharPresets, setShowCharPresets] = useState(false);
    const [savedBadge, setSavedBadge] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Initial load of preferences
    useEffect(() => {
        const savedProvider = localStorage.getItem('omnicorp_ai_provider');
        const savedOpenRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || openrouterEnvKey;
        const savedNvidiaKey = localStorage.getItem('omnicorp_nemotron_api_key') || primaryEnvKey || altEnvKey;
        const savedProxy = localStorage.getItem('omnicorp_custom_proxy') || '';
        const savedModel = localStorage.getItem('omnicorp_nemotron_model');

        // Always prioritize OpenRouter for browser CORS compatibility
        const activeProvider = savedProvider || AI_PROVIDERS.OPENROUTER;
        setProvider(activeProvider);

        const activeKey = activeProvider === AI_PROVIDERS.OPENROUTER ? savedOpenRouterKey : (savedOpenRouterKey || savedNvidiaKey);
        if (activeKey) setApiKey(activeKey);
        if (savedProxy) setCustomProxy(savedProxy);

        if (savedModel && savedModel.includes(':free')) {
            setSelectedModel(savedModel);
        } else {
            setSelectedModel('nvidia/nemotron-3-ultra-550b-a55b:free');
        }
    }, [isOpen, primaryEnvKey, altEnvKey, openrouterEnvKey]);

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

        // Switch to the appropriate key for this provider
        const keyForProvider = newProvider === AI_PROVIDERS.OPENROUTER
            ? (localStorage.getItem('omnicorp_openrouter_api_key') || openrouterEnvKey)
            : (localStorage.getItem('omnicorp_nemotron_api_key') || primaryEnvKey || altEnvKey);
        setApiKey(keyForProvider || '');

        // Switch to the first model of that provider
        const firstMatching = POPULAR_MODELS.find(m => m.provider === newProvider);
        if (firstMatching) {
            setSelectedModel(firstMatching.id);
            localStorage.setItem('omnicorp_nemotron_model', firstMatching.id);
        }
        setErrorMsg('');
        setInfoMsg('');
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
        if (provider === AI_PROVIDERS.OPENROUTER) {
            localStorage.setItem('omnicorp_openrouter_api_key', apiKey.trim());
        } else {
            localStorage.setItem('omnicorp_nemotron_api_key', apiKey.trim());
        }
        localStorage.setItem('omnicorp_custom_proxy', customProxy.trim());
        localStorage.setItem('omnicorp_nemotron_model', selectedModel);
        setIsSettingsOpen(false);
        setErrorMsg('');
        setInfoMsg('');
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
    };

    // Helper to stream simulated text token-by-token
    const streamSimulatedResponse = async (fullText) => {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        const words = fullText.split(' ');
        let accumulated = '';

        for (let i = 0; i < words.length; i++) {
            if (abortControllerRef.current?.signal.aborted) {
                break;
            }
            accumulated += (i === 0 ? '' : ' ') + words[i];
            
            // Periodically update React state
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

        // In cloud modes, check if API key exists
        if (provider !== AI_PROVIDERS.BUILTIN && !apiKey.trim()) {
            setIsSettingsOpen(true);
            setErrorMsg(`Please enter your ${provider === AI_PROVIDERS.OPENROUTER ? 'OpenRouter' : 'NVIDIA'} API key, or switch to the Built-in OmniCorp Engine.`);
            return;
        }

        const newMessages = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        setInputPrompt('');
        setIsLoading(true);
        setErrorMsg('');
        setInfoMsg('');

        abortControllerRef.current = new AbortController();

        // 1. BUILT-IN SIMULATED MODE (100% Reliable on GitHub Pages)
        if (provider === AI_PROVIDERS.BUILTIN) {
            try {
                await new Promise(r => setTimeout(r, 200)); // Slight realistic latency
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

        // 2. CLOUD PROVIDER (NVIDIA NIM or OpenRouter)
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

            // Target endpoint determination
            let endpoints = [];
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            };

            if (provider === AI_PROVIDERS.OPENROUTER) {
                endpoints = ['https://openrouter.ai/api/v1/chat/completions'];
                headers['HTTP-Referer'] = window.location.origin;
                headers['X-Title'] = 'OmniCorp Intranet Studio';
            } else {
                // NVIDIA NIM
                const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
                if (import.meta.env.DEV) {
                    endpoints = [
                        `${baseUrl}/api/nvidia/v1/chat/completions`,
                        '/api/nvidia/v1/chat/completions',
                        'https://integrate.api.nvidia.com/v1/chat/completions'
                    ];
                } else if (customProxy.trim()) {
                    const proxyBase = customProxy.trim().endsWith('?') ? customProxy.trim() : `${customProxy.trim()}?url=`;
                    endpoints = [proxyBase + encodeURIComponent('https://integrate.api.nvidia.com/v1/chat/completions')];
                } else {
                    // Try dev proxy if available, then direct
                    endpoints = [
                        `${baseUrl}/api/nvidia/v1/chat/completions`,
                        '/api/nvidia/v1/chat/completions',
                        'https://integrate.api.nvidia.com/v1/chat/completions'
                    ];
                }
            }

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

            // If Cloud API fails, display clear and provider-accurate instructions
            if (!response) {
                const isCors = lastFetchError?.message?.includes('Failed to fetch') || lastFetchError?.name === 'TypeError';
                const modelObj = POPULAR_MODELS.find(m => m.id === selectedModel);
                let errorHelp = lastFetchError?.message || 'Failed to reach API server.';

                if (provider === AI_PROVIDERS.NVIDIA && isCors) {
                    errorHelp = 'Browser security (CORS) prevented a direct connection to NVIDIA NIM. Direct calls from static web pages are restricted by NVIDIA. To chat with a live LLM: 1) Run locally via `npm run dev` and open http://localhost:5173/web-puzzle-omnicorp-intranet/studio.html (uses the Vite server proxy), or 2) Switch model to an OpenRouter model above or the Built-in OmniCorp Engine.';
                } else if (provider === AI_PROVIDERS.OPENROUTER && isCors) {
                    errorHelp = 'Network connection to OpenRouter could not be established. Please verify your OpenRouter API key in Settings (⚙️), or check if a network ad-blocker is intercepting requests.';
                }

                setErrorMsg(`⚠️ Could not connect to ${modelObj?.name || 'model'}: ${errorHelp}`);
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: `⚠️ **Connection Error**: Could not connect to **${modelObj?.name || selectedModel}**.\n\n${errorHelp}\n\n*💡 Tip: Switch model to "OmniCorp Neural Architect" in the dropdown above for 100% offline, zero-configuration lore generation.*`
                    }
                ]);
                return;
            }

            // Append empty assistant message for live streaming
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

            // Final cleanup of accumulated content
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

    // Helper to extract JSON from assistant message for 1-click import
    const extractCharacterJson = (text) => {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (!jsonMatch) return null;
        try {
            const parsed = JSON.parse(jsonMatch[1]);
            if (parsed.name && parsed.badgeId) {
                return parsed;
            }
        } catch {
            return null;
        }
        return null;
    };

    const handleImportCharacter = (charObj) => {
        if (!onAddCharacter) return;
        const newChar = {
            id: `char_${Date.now()}`,
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
        if (provider === AI_PROVIDERS.BUILTIN) {
            return { label: 'OFFLINE ENGINE', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
        }
        if (provider === AI_PROVIDERS.OPENROUTER) {
            return { label: 'OPENROUTER', color: 'bg-sky-100 text-sky-800 border-sky-300' };
        }
        return { label: 'NVIDIA NIM', color: 'bg-[#ffd6e8] text-[#3b2a5a] border-[#ff9ec7]' };
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
                        <optgroup label="OmniCorp Simulation (Offline & 100% Reliable)">
                            {POPULAR_MODELS.filter(m => m.provider === AI_PROVIDERS.BUILTIN).map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="NVIDIA NIM (Fast Cloud Models)">
                            {POPULAR_MODELS.filter(m => m.provider === AI_PROVIDERS.NVIDIA).map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </optgroup>
                        <optgroup label="OpenRouter (Browser CORS Ready)">
                            {POPULAR_MODELS.filter(m => m.provider === AI_PROVIDERS.OPENROUTER).map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-[#3b2a5a]/60 pointer-events-none" />
                </div>
            </div>

            {/* Settings Overlay Drawer */}
            {isSettingsOpen && (
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
                                onClick={() => handleProviderChange(AI_PROVIDERS.BUILTIN)}
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
                                onClick={() => handleProviderChange(AI_PROVIDERS.NVIDIA)}
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
                                onClick={() => handleProviderChange(AI_PROVIDERS.OPENROUTER)}
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
                            onClick={handleSaveSettings}
                            className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2d1f47] text-[#ffd6e8] border border-[#ff9ec7] rounded-xl font-bold transition-all cursor-pointer shadow-sm text-xs"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Info / Fallback Notification Banner */}
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
                {messages.map((m, idx) => {
                    const charJson = m.role === 'assistant' ? extractCharacterJson(m.content) : null;

                    return (
                        <div
                            key={idx}
                            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className="text-[10px] font-mono font-bold text-[#3b2a5a]/60 mb-1 px-1">
                                {m.role === 'user' ? 'Architect' : currentModelObj.tag}
                            </div>
                            <div
                                className={`rounded-2xl p-3.5 max-w-[92%] ${
                                    m.role === 'user'
                                        ? 'bg-[#3b2a5a] text-[#ffd6e8] border border-[#ff9ec7] rounded-br-sm shadow-md'
                                        : 'bg-white border border-[#c9b6ff] text-[#3b2a5a] rounded-bl-sm shadow-[0_2px_8px_rgba(59,42,90,0.05)]'
                                }`}
                            >
                                {m.role === 'assistant' && m.reasoning && (
                                    <details 
                                        className="mb-2 text-[11px] text-[#3b2a5a]/75 bg-[#f3e8ff]/70 border border-[#c9b6ff]/60 rounded-xl p-2 cursor-pointer group"
                                        open={!m.content && m.isStreaming}
                                    >
                                        <summary className="font-mono font-bold text-[10px] text-[#3b2a5a]/80 select-none flex items-center justify-between list-none">
                                            <span className="flex items-center gap-1.5">
                                                <span className="text-[#ff9ec7]">💭</span>
                                                <span>{m.content ? 'Reasoning Process' : 'Formulating thoughts...'}</span>
                                            </span>
                                            <span className="text-[9px] opacity-60 font-normal">
                                                {m.content ? 'Click to expand' : 'Streaming thoughts...'}
                                            </span>
                                        </summary>
                                        <div className="mt-1.5 pt-1.5 border-t border-[#c9b6ff]/40 text-[#3b2a5a]/80 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                            {m.reasoning}
                                        </div>
                                    </details>
                                )}

                                {m.content ? (
                                    <div className="whitespace-pre-wrap">{m.content}</div>
                                ) : m.isStreaming ? (
                                    <div className="text-[11px] text-[#3b2a5a]/60 italic flex items-center gap-1.5 py-1">
                                        <RefreshCw size={12} className="animate-spin text-[#ff9ec7]" />
                                        <span>Synthesizing response...</span>
                                    </div>
                                ) : null}

                                {/* 1-Click Character Importer & Form Actions */}
                                {charJson && (
                                    <div className="mt-3 pt-3 border-t border-[#c9b6ff]/60 bg-[#f3e8ff]/70 -mx-1 px-3.5 py-2.5 rounded-xl space-y-2.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] uppercase font-mono font-bold text-[#3b2a5a]/60 block">Proposed Character</span>
                                                <span className="text-xs font-bold text-[#3b2a5a]">{charJson.name} ({charJson.badgeId})</span>
                                                <span className="text-[10px] text-[#3b2a5a]/75 block">{charJson.title} • {charJson.dept}</span>
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#c9b6ff] text-[#3b2a5a] font-bold shrink-0">
                                                {charJson.clearance}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-1 border-t border-[#c9b6ff]/40">
                                            <button
                                                onClick={() => handleImportCharacter(charJson)}
                                                className="flex-1 px-3 py-1.5 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#ff8dbb] shadow-sm transition-all cursor-pointer active:scale-95"
                                            >
                                                <Plus size={13} /> 1-Click Add
                                            </button>
                                            {onOpenAddModal && (
                                                <button
                                                    onClick={() => onOpenAddModal(charJson)}
                                                    className="flex-1 px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 border border-[#c9b6ff] shadow-xs transition-all cursor-pointer active:scale-95"
                                                    title="Open in Add Character form to review and edit before saving"
                                                >
                                                    <Edit3 size={12} /> Review in Form
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

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
                        {selectedModel !== 'nvidia/nemotron-3-super-120b-a12b' && provider === AI_PROVIDERS.NVIDIA && (
                            <div className="text-[10px] text-[#3b2a5a]/80 bg-[#ffd6e8]/40 border border-[#ff9ec7] rounded-xl p-2 leading-relaxed">
                                💡 <strong>Tip:</strong> DeepSeek & Kimi k3 have long serverless queue times. Switch model to <strong>NVIDIA Nemotron 3 120B</strong> above for instant ~1-second responses!
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
                {/* Dedicated Add Character Button */}
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

                {[
                    '🎭 Sector 7 Hazmat Tech',
                    '💬 Draft Act 2 Chat for Bowman',
                    '🔍 Formulate PO-4412 Clue',
                    '🧩 Suggest Act 3 Ending'
                ].map((chip, idx) => (
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
