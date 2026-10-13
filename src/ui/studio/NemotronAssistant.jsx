import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Key, Sparkles, Plus, Trash2, X, RefreshCw, Cpu, Check, AlertCircle, Copy, HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

const POPULAR_MODELS = [
    { id: 'deepseek-ai/deepseek-v4.1-flash', name: 'NVIDIA DeepSeek v4.1 Flash (Experimental)', tag: 'DeepSeek' },
    { id: 'moonshotai/kimi-k3', name: 'Moonshot Kimi k3 (Experimental / 2.8T MoE)', tag: 'Kimi k3' }
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
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('deepseek-ai/deepseek-v4.1-flash');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Greetings Architect. I am your **OmniCorp AI Co-Writer**. You can toggle between **NVIDIA DeepSeek v4.1 Flash** and **Moonshot Kimi k3** in the model bar above. Ask me to formulate new employees, dialogue logs, PO clues, or story branches!'
        }
    ]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [copiedKeyBadge, setCopiedKeyBadge] = useState(false);
    const messagesEndRef = useRef(null);

    const primaryEnvKey = import.meta.env.VITE_NVIDIA_API_KEY || '';
    const altEnvKey = import.meta.env.VITE_NVIDIA_API_KEY_ALT || '';

    useEffect(() => {
        const savedKey = localStorage.getItem('omnicorp_nemotron_api_key') || primaryEnvKey || altEnvKey;
        const savedModel = localStorage.getItem('omnicorp_nemotron_model') || 'deepseek-ai/deepseek-v4.1-flash';
        setApiKey(savedKey);
        setSelectedModel(savedModel);
        if (!savedKey) {
            setIsSettingsOpen(true);
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
        setSelectedModel(newModel);
        localStorage.setItem('omnicorp_nemotron_model', newModel);
        const modelObj = POPULAR_MODELS.find(m => m.id === newModel);
        const modelName = modelObj ? modelObj.name : newModel;
        setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `⚡ Active model switched to **${modelName}**.` }
        ]);
    };

    const handleSaveSettings = () => {
        localStorage.setItem('omnicorp_nemotron_api_key', apiKey.trim());
        localStorage.setItem('omnicorp_nemotron_model', selectedModel);
        setIsSettingsOpen(false);
        setErrorMsg('');
        setCopiedKeyBadge(true);
        setTimeout(() => setCopiedKeyBadge(false), 2000);
    };

    const handleSendMessage = async (customPrompt) => {
        const textToSend = customPrompt || inputPrompt;
        if (!textToSend.trim()) return;

        if (!apiKey.trim()) {
            setIsSettingsOpen(true);
            setErrorMsg('Please enter your NVIDIA API key to connect to the AI model.');
            return;
        }

        const newMessages = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        setInputPrompt('');
        setIsLoading(true);
        setErrorMsg('');

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
                max_tokens: 700
            });

            // In dev mode, use Vite proxy to avoid browser CORS; in prod, try direct then fallback
            const targetEndpoints = import.meta.env.DEV
                ? ['/api/nvidia/v1/chat/completions', 'https://integrate.api.nvidia.com/v1/chat/completions']
                : ['https://integrate.api.nvidia.com/v1/chat/completions', 'https://corsproxy.io/?url=https%3A%2F%2Fintegrate.api.nvidia.com%2Fv1%2Fchat%2Fcompletions'];

            let response = null;
            let lastFetchError = null;

            for (const endpoint of targetEndpoints) {
                try {
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey.trim()}`
                        },
                        body: payloadBody
                    });
                    if (res.ok) {
                        response = res;
                        break;
                    } else {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.message || errData.error?.message || `API HTTP ${res.status}`);
                    }
                } catch (err) {
                    lastFetchError = err;
                }
            }

            if (!response) {
                throw lastFetchError || new Error('Network error: Unable to reach NVIDIA NIM endpoint.');
            }

            const data = await response.json();
            const choiceMsg = data.choices?.[0]?.message;
            let replyContent = choiceMsg?.content;
            if (!replyContent || !replyContent.trim()) {
                replyContent = choiceMsg?.reasoning_content;
            }
            if (!replyContent || !replyContent.trim()) {
                replyContent = 'No response returned from model.';
            } else {
                // Clean up Moonshot/DeepSeek internal tags
                replyContent = replyContent.replace(/<\|close\|>message/g, '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            }

            setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);

        } catch (err) {
            setErrorMsg(err.message || 'Failed to connect to NVIDIA API.');
        } finally {
            setIsLoading(false);
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
                            <span className="text-[10px] font-mono font-bold bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7] px-2 py-0.5 rounded-full shadow-xs">
                                NVIDIA NIM
                            </span>
                        </div>
                        <p className="text-[11px] text-[#3b2a5a]/70 font-medium truncate max-w-[220px]">
                            {currentModelObj.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSettingsOpen 
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-sm' 
                                : 'bg-white border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40 shadow-xs'
                        }`}
                        title="API Key & Credentials"
                    >
                        <Key size={14} />
                    </button>
                    <button
                        onClick={() => setMessages([{ role: 'assistant', content: 'Chat history cleared. Ready for your next narrative inquiry.' }])}
                        className="p-1.5 rounded-xl bg-white border border-[#c9b6ff] text-[#3b2a5a] hover:bg-[#ffd6e8]/40 shadow-xs transition-colors cursor-pointer"
                        title="Clear Chat History"
                    >
                        <Trash2 size={14} />
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
                            <option key={m.id} value={m.id} className="font-sans font-medium text-[#3b2a5a]">
                                {m.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-[#3b2a5a]/60 pointer-events-none" />
                </div>
            </div>

            {/* Settings Overlay Drawer */}
            {isSettingsOpen && (
                <div className="p-4 bg-[#fbf7ff] border-b border-[#c9b6ff] text-xs space-y-3 animate-in fade-in shadow-inner">
                    <div className="flex items-center justify-between text-[#3b2a5a] font-bold text-[11px] uppercase tracking-wider">
                        <span>NVIDIA NIM Authentication</span>
                        <a
                            href="https://build.nvidia.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#3b2a5a] hover:underline normal-case font-semibold text-[11px]"
                        >
                            build.nvidia.com ↗
                        </a>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-[#3b2a5a]">Active API Key</label>
                            {/* Key Preset Selector Buttons */}
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
                                        title="Use WebPuzzle-Studio Key"
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
                                        title="Use Moonshot Kimi Key"
                                    >
                                        Use Alternate
                                    </button>
                                )}
                            </div>
                        </div>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="nvapi-xxxxxxxxxxxx"
                            className="w-full bg-white border border-[#c9b6ff] rounded-xl px-3 py-1.5 font-mono text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] text-xs shadow-xs"
                        />
                        <p className="text-[10px] text-[#3b2a5a]/70 mt-1">Saved locally in browser and loaded from your private .env.local file.</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        {copiedKeyBadge ? (
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 size={13} /> Settings Saved
                            </span>
                        ) : <div />}
                        <button
                            onClick={handleSaveSettings}
                            className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2d1f47] text-[#ffd6e8] border border-[#ff9ec7] rounded-xl font-bold transition-all cursor-pointer shadow-sm text-xs"
                        >
                            Save Credentials
                        </button>
                    </div>
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
                    <div className="flex items-center gap-2 text-[#3b2a5a] text-xs py-2 px-1 font-semibold">
                        <RefreshCw size={14} className="animate-spin text-[#3b2a5a]" />
                        <span>Formulating narrative logic via {currentModelObj.tag}...</span>
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
