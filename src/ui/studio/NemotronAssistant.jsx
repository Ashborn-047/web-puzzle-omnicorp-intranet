import React, { useState, useEffect, useRef } from 'react';
import { 
    Bot, Send, Key, Sparkles, Plus, X, RefreshCw, AlertCircle, 
    ChevronDown, CheckCircle2, SlidersHorizontal, Globe, Zap, ShieldCheck 
} from 'lucide-react';
import { generateOmniCorpSimulatedResponse } from './omnicorpSimulator.js';

const AI_PROVIDERS = {
    BUILTIN: 'builtin',
    NVIDIA: 'nvidia',
    OPENROUTER: 'openrouter'
};

const POPULAR_MODELS = [
    // Built-in OmniCorp Lore Engine (Zero configuration, 100% reliable on GitHub Pages)
    { 
        id: 'builtin/omnicorp-neural', 
        name: 'OmniCorp Neural Architect (Offline • 100% Reliable)', 
        tag: 'OmniCorp Neural',
        provider: AI_PROVIDERS.BUILTIN 
    },
    // NVIDIA NIM Models (Ultra-fast when running locally or with proxy)
    { 
        id: 'nvidia/nemotron-3-super-120b-a12b', 
        name: 'NVIDIA Nemotron 3 120B (Recommended • Fast ~1s)', 
        tag: 'Nemotron 120B',
        provider: AI_PROVIDERS.NVIDIA 
    },
    { 
        id: 'deepseek-ai/deepseek-v4.1-flash', 
        name: 'NVIDIA DeepSeek v4.1 Flash (Experimental)', 
        tag: 'DeepSeek v4.1',
        provider: AI_PROVIDERS.NVIDIA 
    },
    { 
        id: 'moonshotai/kimi-k3', 
        name: 'Moonshot Kimi k3 (2.8T MoE)', 
        tag: 'Kimi k3',
        provider: AI_PROVIDERS.NVIDIA 
    },
    // OpenRouter Models (Full native browser CORS support on GitHub Pages)
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

const OMNICORP_SYSTEM_PROMPT = `You are the OmniCorp Narrative Architect AI, an expert co-writer embedded in the development studio for the corporate mystery / cosmic horror ARG puzzle game "OmniCorp Intranet".

LORE & WORLD RULES:
- Setting: OmniCorp Intranet (a seemingly sterile corporate portal hiding an occult algorithmic loop).
- The Loop: The protagonist is AUDIT-04, an external contractor reviewing vendor accounts. In reality, this is iteration 14 of an algorithmic loop trapped inside "Project Omega".
- Key Characters:
  * Sarah Kone (7700): Chief Auditor, naive believer in HR escalations, holds L2 credentials unredacting PO-4412.
  * Bill Lumbergh (0451): Procurement director routing biological slurry & cryo-crates disguised as janitorial goods.
  * Isaac Clarke (1001): Sector 7 maintenance engineer panicked over NODE-666 organic clogs.
  * David Bowman (9000): Lead SysAdmin, aware of the loop via terminal residue, running rogue SSH sessions.
  * Patricia Vance (4492): HR Director converting human harvesting into "Resource Deprovisioning" memos; guards Black Vault (PIN 1979).
  * Ellen Ripley (1979): MIA predecessor scientist who left secret recordings.
  * Subject 882: The sacrificial human founding neural vessel for Omega.
- Tone: Clinical corporate speak, psychological dread, corporate banal evil, authentic IT and audit terminology.

WHEN ASKED TO CREATE OR GENERATE A CHARACTER:
Always include a clean JSON code block in this exact structure so the user can import it directly with 1-click:
\`\`\`json
{
  "name": "Full Name",
  "badgeId": "XXXX",
  "dept": "HQ - FINANCE | HQ - IT | HQ - HR | SECTOR 7 - R&D | SECTOR 7 - MAINTENANCE | SALES & PROCUREMENT",
  "title": "Corporate Job Title",
  "tier": "Protagonist | Main Target | Supporting | Background | Deceased / MIA",
  "clearance": "L0 (EXTERNAL) | L1 (INTERNAL) | L2 (DEPT_SUPERVISOR) | L3 (EXECUTIVE) | L-OMEGA",
  "status": "Active | Under Review | MIA | Reassigned",
  "clueHeld": "What clue, login or puzzle piece they provide",
  "messageSnippet": "An in-character email, memo or chat snippet",
  "loreNotes": "Brief secret backstory and motivations"
}
\`\`\`
Keep responses snappy, concise, and direct (under 3-4 sentences max unless generating character JSON). Respond immediately without prolonged reasoning.`;

export default function NemotronAssistant({
    isOpen,
    onClose,
    onAddCharacter,
    characters = [],
    decisionLines = []
}) {
    const primaryEnvKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
    const altEnvKey = import.meta.env.VITE_NVIDIA_API_KEY_ALT || '';

    const [provider, setProvider] = useState(AI_PROVIDERS.NVIDIA);
    const [apiKey, setApiKey] = useState('');
    const [customProxy, setCustomProxy] = useState('');
    const [selectedModel, setSelectedModel] = useState('nvidia/nemotron-3-super-120b-a12b');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Greetings Architect. I am your **OmniCorp AI Co-Writer**. Ready to formulate new employees, dialogue logs, PO clues, or story branches! You can switch models or providers anytime using the bar above.'
        }
    ]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [savedBadge, setSavedBadge] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Initial load of preferences
    useEffect(() => {
        const savedProvider = localStorage.getItem('omnicorp_ai_provider');
        const savedKey = localStorage.getItem('omnicorp_nemotron_api_key') || primaryEnvKey || altEnvKey;
        const savedProxy = localStorage.getItem('omnicorp_custom_proxy') || '';
        const savedModel = localStorage.getItem('omnicorp_nemotron_model');

        if (savedKey) setApiKey(savedKey);
        if (savedProxy) setCustomProxy(savedProxy);

        // If on production / GitHub Pages and no key is set, default to Built-in Simulator so it works immediately
        if (savedProvider) {
            setProvider(savedProvider);
        } else if (!import.meta.env.DEV && !savedKey) {
            setProvider(AI_PROVIDERS.BUILTIN);
            setSelectedModel('builtin/omnicorp-neural');
        } else {
            setProvider(AI_PROVIDERS.NVIDIA);
        }

        if (savedModel) {
            setSelectedModel(savedModel);
        }
    }, [isOpen, primaryEnvKey, altEnvKey]);

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
        localStorage.setItem('omnicorp_nemotron_api_key', apiKey.trim());
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
                max_tokens: 700,
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
                if (import.meta.env.DEV) {
                    endpoints = ['/api/nvidia/v1/chat/completions', 'https://integrate.api.nvidia.com/v1/chat/completions'];
                } else if (customProxy.trim()) {
                    const proxyBase = customProxy.trim().endsWith('?') ? customProxy.trim() : `${customProxy.trim()}?url=`;
                    endpoints = [proxyBase + encodeURIComponent('https://integrate.api.nvidia.com/v1/chat/completions')];
                } else {
                    // Direct NVIDIA call (Note: browser CORS usually blocks this on static GitHub Pages)
                    endpoints = ['https://integrate.api.nvidia.com/v1/chat/completions'];
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

            // AUTO-FAILOVER: If Cloud API fails due to CORS or network on GitHub Pages, fallback to Built-in Simulator
            if (!response) {
                console.warn('External API call failed, activating OmniCorp Neural Simulator failover:', lastFetchError);
                setInfoMsg('⚠️ External NIM endpoint blocked by browser CORS on static GitHub Pages. Auto-switched to Built-in OmniCorp Neural Engine.');
                const fallbackText = generateOmniCorpSimulatedResponse(textToSend, { characters, decisionLines });
                await streamSimulatedResponse(fallbackText);
                return;
            }

            // Append empty assistant message for live streaming
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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

                                const activeDisplay = (responseText || (reasoningText ? `*Drafting...*\n${reasoningText}` : ''))
                                    .replace(/<\|close\|>message/g, '')
                                    .replace(/<think>[\s\S]*?<\/think>/g, '');

                                if (activeDisplay) {
                                    setMessages(prev => {
                                        const updated = [...prev];
                                        updated[updated.length - 1] = {
                                            role: 'assistant',
                                            content: activeDisplay
                                        };
                                        return updated;
                                    });
                                }
                            } catch {
                                // Ignore unparseable SSE line fragments
                            }
                        }
                    }
                }
            } else {
                const data = await response.json();
                const choiceMsg = data.choices?.[0]?.message;
                responseText = choiceMsg?.content || choiceMsg?.reasoning_content || 'No response returned.';
            }

            // Final cleanup of accumulated content
            const finalCleaned = (responseText || reasoningText || '')
                .replace(/<\|close\|>message/g, '')
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .trim();

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: finalCleaned || 'No response returned from model.'
                };
                return updated;
            });
        } catch (err) {
            if (err.name !== 'AbortError' && err.message !== 'Request was cancelled.') {
                // If cloud fails, fallback to built-in simulation gracefully
                console.warn('Cloud API error, engaging simulator fallback:', err);
                setInfoMsg(`⚠️ External API error: ${err.message}. Switched to OmniCorp Neural Engine.`);
                const fallbackText = generateOmniCorpSimulatedResponse(textToSend, { characters, decisionLines });
                await streamSimulatedResponse(fallbackText);
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
                                <div className="whitespace-pre-wrap">{m.content}</div>

                                {/* 1-Click Character Importer button if JSON found */}
                                {charJson && (
                                    <div className="mt-3 pt-3 border-t border-[#c9b6ff]/60 flex items-center justify-between bg-[#f3e8ff]/50 -mx-1 px-3 py-2 rounded-xl">
                                        <div className="text-[11px] font-bold text-[#3b2a5a]">
                                            Character: <span className="underline">{charJson.name}</span>
                                        </div>
                                        <button
                                            onClick={() => handleImportCharacter(charJson)}
                                            className="px-3 py-1 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold text-[11px] flex items-center gap-1 border border-[#ff8dbb] shadow-sm transition-all cursor-pointer active:scale-95"
                                        >
                                            <Plus size={12} /> Add to Roster
                                        </button>
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

            {/* Quick Inspiration Chips */}
            <div className="px-4 py-2 border-t border-[#c9b6ff] bg-[#f3e8ff] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] text-[#3b2a5a]/70 font-mono font-bold shrink-0">Prompts:</span>
                {[
                    '🎭 Create Sector 7 Hazmat Tech',
                    '💬 Draft Act 2 Chat for Bowman',
                    '🔍 Formulate PO-4412 Audit Clue',
                    '🧩 Suggest Act 3 Ending Branch'
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
