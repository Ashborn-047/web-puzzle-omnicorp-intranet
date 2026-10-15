import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Sparkles, Send, Bot, RefreshCw, Key, MessageSquare, 
    FileText, User, Shield, Tag, Building2, CheckCircle2, 
    Copy, Edit3, ArrowRight, GitCommit, AlertTriangle, ChevronRight,
    HelpCircle, Wand2, ThumbsUp, MessageCircle, Maximize2, Minimize2,
    ExternalLink, Columns, ChevronLeft, Layout
} from 'lucide-react';
import { generateOmniCorpSimulatedResponse } from './omnicorpSimulator.js';

export default function CharacterDossierModal({
    character,
    onClose,
    onUpdateCharacter,
    onOpenEditForm,
    onSelectCharacter,
    decisionLines = [],
    characters = []
}) {
    if (!character) return null;

    // Window size & View layout state: 'split' | 'dossier' | 'ai_cowriter'
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [viewMode, setViewMode] = useState('split');
    const [editableLore, setEditableLore] = useState(character.loreNotes || '');
    const [isSavingLore, setIsSavingLore] = useState(false);
    const [loreSavedSuccess, setLoreSavedSuccess] = useState(false);

    // Collaborative AI Co-Writer states
    const [chatInput, setChatInput] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [appliedSuccess, setAppliedSuccess] = useState('');
    const [showKeyConfig, setShowKeyConfig] = useState(false);
    const [openRouterKeyInput, setOpenRouterKeyInput] = useState(() => {
        return localStorage.getItem('omnicorp_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    });
    const messagesEndRef = useRef(null);
    const abortRef = useRef(null);

    const handleSaveOpenRouterKey = (val) => {
        const trimmed = (val || '').trim();
        localStorage.setItem('omnicorp_openrouter_api_key', trimmed);
        localStorage.setItem('omnicorp_ai_provider', 'openrouter');
        setOpenRouterKeyInput(trimmed);
        setShowKeyConfig(false);
        setAppliedSuccess('Saved OpenRouter API Key!');
        setTimeout(() => setAppliedSuccess(''), 2500);
    };

    // Initial greeting in collaborative chat
    const getInitialGreeting = (char) => {
        const missingItems = [];
        if (!char.clueHeld) missingItems.push('Forensic Puzzle Clue');
        if (!char.messageSnippet) missingItems.push('Recorded Voice Memo / Chat Residue');
        if (!char.loreNotes) missingItems.push('Backstory & Lore Notes');

        const auditSummary = missingItems.length === 0
            ? '✅ Core personnel fields populated. Ready for creative deepening and consistency checking.'
            : `⚠️ **Needs Creative Input:** ${missingItems.join(', ')}`;

        return {
            role: 'assistant',
            content: `Greetings, Architect! I have opened the personnel file for **${char.name}** (${char.title} • ${char.dept} • Clearance ${char.clearance}).\n\n📊 **Collaborative File Audit:**\n- 🔑 **Clue / Credential:** ${char.clueHeld ? `\`${char.clueHeld}\`` : '⚠️ *Unassigned*'}\n- 💬 **Recorded Voice:** ${char.messageSnippet ? `"${char.messageSnippet}"` : '⚠️ *None on file*'}\n- 📜 **Lore & Motive:** ${char.loreNotes ? char.loreNotes : '⚠️ *Needs expansion*'}\n- 🔍 **Status:** ${auditSummary}\n\n🤝 **Here are 3 key decisions we should make together:**\n1. **Secret Motive & Allegiance:** Is ${char.name} loyal to OmniCorp, secretly leaking documents to Sarah Kone, or an unwitting victim caught in Project Omega?\n2. **Forensic Trace:** What physical evidence or password code should players discover from them in the game?\n3. **Tone & Conflict:** Should they sound coldly bureaucratic, frantic and sleep-deprived, or terrified of HR Director Patricia Vance?\n\nWhat direction do you envision? You can answer any question above, give instructions, or pick a starting prompt below!`,
            suggestions: [
                `🔍 Audit ${char.name}'s details & prompt me with 2 story directions`,
                `Let's draft their secret motive and fear of HR deprovisioning`,
                `Design a forensic puzzle clue for ${char.name} to hold`,
                `Draft a frantic intercepted audio memo from ${char.name}`
            ]
        };
    };

    const [chatMessages, setChatMessages] = useState(() => [getInitialGreeting(character)]);

    // Reset when character changes
    useEffect(() => {
        setEditableLore(character.loreNotes || '');
        setChatMessages([getInitialGreeting(character)]);
        setAiError('');
        setAppliedSuccess('');
    }, [character.id]);

    useEffect(() => {
        if (viewMode === 'ai_cowriter' || viewMode === 'split') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isAiGenerating, viewMode]);

    // Character connections in graph
    const relatedLinks = decisionLines.filter(
        line => line.fromCharId === character.id || line.toCharId === character.id
    );

    // Quick Character switching in roster
    const currentIndex = characters.findIndex(c => c.id === character.id);
    const handlePrevChar = () => {
        if (!onSelectCharacter || characters.length === 0) return;
        const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
        onSelectCharacter(characters[prevIndex]);
    };
    const handleNextChar = () => {
        if (!onSelectCharacter || characters.length === 0) return;
        const nextIndex = (currentIndex + 1) % characters.length;
        onSelectCharacter(characters[nextIndex]);
    };

    const handlePopOutWindow = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('dossier', character.id);
        window.open(url.toString(), '_blank', 'width=1600,height=960,menubar=no,toolbar=no');
    };

    const handleSaveManualLore = () => {
        setIsSavingLore(true);
        const updated = {
            ...character,
            loreNotes: editableLore
        };
        onUpdateCharacter(updated);
        setIsSavingLore(false);
        setLoreSavedSuccess(true);
        setTimeout(() => setLoreSavedSuccess(false), 2200);
    };

    // Collaborative AI Co-Writer Send
    const handleSendMessage = async (userPromptText) => {
        const textToSend = userPromptText || chatInput;
        if (!textToSend.trim()) return;

        const updatedHistory = [...chatMessages, { role: 'user', content: textToSend }];
        setChatMessages(updatedHistory);
        setChatInput('');
        setIsAiGenerating(true);
        setAiError('');
        setAppliedSuccess('');

        abortRef.current = new AbortController();

        const savedOpenRouterKey = (localStorage.getItem('omnicorp_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
        const selectedModel = localStorage.getItem('omnicorp_nemotron_model') || 'nvidia/nemotron-3-ultra-550b-a55b:free';
        const apiKey = savedOpenRouterKey;

        // If no OpenRouter key is set, guide the user directly
        if (!apiKey) {
            setShowKeyConfig(true);
            try {
                await new Promise(r => setTimeout(r, 350));
                let simText = '';
                if (textToSend.toLowerCase().includes('audit')) {
                    simText = `### 🔍 Collaborative Narrative Audit: ${character.name}\n\n` +
                        `**Department & Clearance Analysis:**\n` +
                        `- Working in **${character.dept}** with **${character.clearance}** gives them access to internal logs, but Sector 7 anomalies require Level 4+ authorization.\n` +
                        `- **Potential Conflict:** If ${character.name} discovers Project Omega documentation, it represents an unauthorized security breach.\n\n` +
                        `**Proposed Story Directions:**\n` +
                        `- **Option A (Reluctant Whistleblower):** ${character.name} noticed altered PO-4412 manifests and hid an encrypted flash drive before HR could deprovision their badge.\n` +
                        `- **Option B (OmniCorp Loyal Pawn):** ${character.name} actively rationalizes the strange bio-containment failures as "routine HVAC calibration," leaving behind unintentional clues for the player.`;
                } else {
                    simText = generateOmniCorpSimulatedResponse(
                        `Character ${character.name} in ${character.dept}. ${textToSend}`,
                        { characters, decisionLines }
                    );
                }

                const keyNotice = `\n\n> 🔑 **CORS Mode Ready (OpenRouter):** *Please paste your OpenRouter API key (\`sk-or-v1-...\`) into the top drawer above to connect live Nemotron models directly in your browser. (Showing built-in draft in the meantime).*`;

                const collaborativeEnding = `\n\n---\n🤝 **Collaborative Check & Refinements:**\n` +
                    `How would you like to proceed? We can:\n` +
                    `1. Adjust their emotional tone (make them more paranoid vs sterile corporate).\n` +
                    `2. Connect them directly to Sarah Kone's financial investigation or Vance's HR threats.\n` +
                    `3. Change or refine any part of this description before saving.\n\n` +
                    `*What changes or additions would you like to make?*`;

                setChatMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: simText + keyNotice + collaborativeEnding,
                        suggestions: [
                            `Option A: Make them a reluctant whistleblower`,
                            `Option B: Make them an unwitting corporate pawn`,
                            `Make their tone more frantic and paranoid`,
                            `Add an encrypted USB clue with PO-4412 discrepancy`,
                            `Prompt me with 3 more story questions`
                        ]
                    }
                ]);
            } catch (err) {
                setAiError(err.message);
            } finally {
                setIsAiGenerating(false);
                abortRef.current = null;
            }
            return;
        }

        try {
            const systemPrompt = `You are a collaborative storytelling co-writer and narrative architect for the cosmic horror ARG puzzle game "OmniCorp Intranet".
You are collaborating directly with the game designer to co-create and polish the personnel dossier for:
- Name: ${character.name} (Badge ID: ${character.badgeId})
- Corporate Role: ${character.title}
- Department: ${character.dept}
- Clearance Level: ${character.clearance}
- Story Tier: ${character.tier}
- Clue/Credential Held: ${character.clueHeld || 'None'}
- Current Quote/Memo: ${character.messageSnippet || 'None'}
- Current Lore Notes: ${character.loreNotes || 'None'}

COLLABORATIVE CO-WRITING INSTRUCTIONS:
1. ACT AS AN ACTIVE CREATIVE PARTNER: Do not just write a static essay. Always collaborate by proposing ideas, inviting the user's creative judgment, and asking how they would like to modify it.
2. CHECK NECESSARY DETAILS: Check clearance plausibility, emotional tone, and puzzle clues. Point out anything that is missing or could create higher drama (e.g. "Notice they have Level 2 clearance but access Sub-level 7 — should we make that an unauthorized breach?").
3. PRESENT OPTIONS: Whenever suggesting a new angle, give 2 distinct choices (Option A vs Option B) so the user can easily choose or synthesize them.
4. PROMPT THE USER TO CHANGE ANYTHING: Conclude every response with a dedicated section:
"🤝 Collaborative Check & Next Decisions:"
- List 2-3 specific questions prompting the user to check or alter details (e.g. tone, clue item, relationship to Sarah Kone, Patricia Vance, or Subject 882).
- Explicitly ask: "Would you like to change anything in this proposal, or adjust the tone before we apply it?"
5. Keep corporate atmosphere rich, unsettling, and authentic to cosmic corporate horror. Use clean markdown formatting.`;

            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...updatedHistory.slice(-8).map(m => ({ role: m.role, content: m.content }))
            ];

            const payloadBody = JSON.stringify({
                model: selectedModel,
                messages: apiMessages,
                temperature: 0.7,
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
            let lastErr = null;

            for (const ep of endpoints) {
                try {
                    const res = await fetch(ep, {
                        method: 'POST',
                        headers,
                        body: payloadBody,
                        signal: abortRef.current.signal
                    });
                    if (res.ok) {
                        response = res;
                        break;
                    } else {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.message || errData.error?.message || `HTTP ${res.status}`);
                    }
                } catch (e) {
                    if (e.name === 'AbortError') return;
                    lastErr = e;
                }
            }

            if (!response) {
                throw new Error(lastErr?.message || 'Could not reach OpenRouter API endpoint.');
            }

            setChatMessages(prev => [...prev, { role: 'assistant', content: '', reasoning: '', isStreaming: true }]);

            let accContent = '';
            let accReasoning = '';

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
                                if (delta?.content) {
                                    accContent += delta.content;
                                }
                                if (delta?.reasoning_content) {
                                    accReasoning += delta.reasoning_content;
                                }

                                const cleanC = accContent.replace(/<think>[\s\S]*?<\/think>/g, '');
                                const cleanR = accReasoning.replace(/<think>[\s\S]*?<\/think>/g, '');

                                setChatMessages(prev => {
                                    const updated = [...prev];
                                    updated[updated.length - 1] = {
                                        role: 'assistant',
                                        content: cleanC,
                                        reasoning: cleanR,
                                        isStreaming: true
                                    };
                                    return updated;
                                });
                            } catch {
                                // Ignore partial SSE fragments
                            }
                        }
                    }
                }
            } else {
                const data = await response.json();
                accContent = data.choices?.[0]?.message?.content || '';
                accReasoning = data.choices?.[0]?.message?.reasoning_content || '';
            }

            const dynamicSuggestions = [
                `Option A: Emphasize their secret whistleblowing against OmniCorp`,
                `Option B: Make them an unwitting pawn caught in Sub-level 7`,
                `Make their voice memo much more panicked and erratic`,
                `Change the clue into an encrypted flash drive with PO-4412 manifests`,
                `Prompt me with 3 more questions to refine this character`
            ];

            setChatMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accContent.trim() || accReasoning.trim() || 'No response returned from model.',
                    reasoning: accReasoning.trim(),
                    isStreaming: false,
                    suggestions: dynamicSuggestions
                };
                return updated;
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                const isAuthErr = err.message.toLowerCase().includes('authentication') || 
                                  err.message.toLowerCase().includes('unauthorized') || 
                                  err.message.includes('401');
                setAiError(err.message);

                const simText = generateOmniCorpSimulatedResponse(
                    `Character ${character.name} in ${character.dept}. ${textToSend}`,
                    { characters, decisionLines }
                );
                const collaborativeEnding = `\n\n---\n🤝 **Collaborative Check & Refinements:**\n` +
                    `How would you like to proceed? We can:\n` +
                    `1. Adjust their emotional tone (make them more paranoid vs sterile corporate).\n` +
                    `2. Connect them directly to Sarah Kone's financial investigation or Vance's HR threats.\n` +
                    `3. Change or refine any part of this description before saving.\n\n` +
                    `*What changes or additions would you like to make?*`;

                const notice = isAuthErr
                    ? `> ⚠️ *Live cloud key missing or unauthorized. Click **"🔑 Set OpenRouter Key"** above to paste your key (\`sk-or-v1-...\`).*`
                    : `> ℹ️ *Cloud service notice (${err.message}). Displaying built-in narrative generator.*`;

                setChatMessages(prev => [
                    ...prev,
                    { 
                        role: 'assistant', 
                        content: simText + `\n\n` + notice + collaborativeEnding,
                        suggestions: [
                            `Option A: Make them a reluctant whistleblower`,
                            `Option B: Make them an unwitting corporate pawn`,
                            `Make their tone more frantic and paranoid`,
                            `Add an encrypted USB clue with PO-4412 discrepancy`,
                            `Prompt me with 3 more story questions`
                        ]
                    }
                ]);
                if (isAuthErr) {
                    setShowKeyConfig(true);
                }
            }
        } finally {
            setIsAiGenerating(false);
            abortRef.current = null;
        }
    };

    // Apply AI content directly to character fields
    const handleApplyTextToLore = (text, mode = 'replace') => {
        if (!text) return;
        const cleaned = text.split(/\n---\n|\n\*\*Would you like|\nWould you like|\n## 🤝|\n🤝/i)[0].trim();
        const newLore = mode === 'append' ? `${editableLore}\n\n${cleaned}` : cleaned;
        setEditableLore(newLore);
        const updated = { ...character, loreNotes: newLore };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated backstory for ${character.name}!`);
        setTimeout(() => setAppliedSuccess(''), 3000);
    };

    const handleApplyTextToQuote = (text) => {
        if (!text) return;
        const quoteMatch = text.match(/"([^"]+)"/);
        const extracted = quoteMatch ? quoteMatch[1] : text.split('\n')[0].replace(/^[#*>\s]+/, '').trim();
        const updated = { ...character, messageSnippet: extracted };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated voice quote for ${character.name}!`);
        setTimeout(() => setAppliedSuccess(''), 3000);
    };

    const handleApplyTextToClue = (text) => {
        if (!text) return;
        const firstLine = text.split('\n')[0].replace(/^[#*>\s]+/, '').replace(/^(Clue|Item):\s*/i, '').trim();
        const updated = { ...character, clueHeld: firstLine };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated forensic clue for ${character.name}!`);
        setTimeout(() => setAppliedSuccess(''), 3000);
    };

    const getTierBadge = (tier) => {
        switch (tier) {
            case 'Protagonist': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'Main Target': return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
            case 'Supporting': return 'bg-purple-100 text-purple-800 border-purple-300';
            case 'Deceased / MIA': return 'bg-slate-200 text-slate-800 border-slate-300 line-through';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    // ==========================================
    // PANE 1: DETAILED DOSSIER & LORE EDITOR
    // ==========================================
    const renderDossierContent = () => (
        <div className="space-y-4">
            {/* Clue & Recorded Voice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Clue / Credential */}
                <div className="bg-gradient-to-br from-[#fff5f9] to-[#ffd6e8]/40 p-4 rounded-2xl border border-[#ff9ec7]/80 shadow-[0_2px_8px_rgba(255,158,199,0.12)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                            <Key size={14} className="text-[#ff70aa]" />
                            <span>Forensic Clue / Credential Held</span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#3b2a5a] leading-relaxed">
                            {character.clueHeld || 'No forensic clue or security credential specified for this employee.'}
                        </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#ff9ec7]/40 flex items-center justify-between text-[11px] text-[#3b2a5a]/70 font-mono">
                        <span>Clearance: {character.clearance}</span>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(character.clueHeld || '');
                                setAppliedSuccess('Clue copied to clipboard!');
                                setTimeout(() => setAppliedSuccess(''), 2000);
                            }}
                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                </div>

                {/* Voice / Chat Residue */}
                <div className="bg-white p-4 rounded-2xl border border-[#c9b6ff] shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                            <MessageSquare size={14} className="text-[#7c5cb7]" />
                            <span>Recorded Voice / Chat Residue</span>
                        </div>
                        <blockquote className="text-xs sm:text-sm text-[#3b2a5a] italic leading-relaxed pl-3 border-l-2 border-[#ff9ec7]">
                            "{character.messageSnippet || 'No recorded audio log or terminal chat residue discovered in this iteration.'}"
                        </blockquote>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#c9b6ff]/40 flex items-center justify-between text-[11px] text-[#3b2a5a]/70 font-mono">
                        <span>#{character.dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}-internal</span>
                        <button
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(character.messageSnippet || '');
                                setAppliedSuccess('Quote copied to clipboard!');
                                setTimeout(() => setAppliedSuccess(''), 2000);
                            }}
                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                        >
                            <Copy size={12} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Expansive Character Backstory & Lore Notes Editor */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#3b2a5a]" />
                        <h3 className="text-sm font-bold text-[#3b2a5a]">
                            Character Backstory, Secret Motives & Lore Notes
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#3b2a5a]/60">
                        {editableLore ? `${editableLore.split(/\s+/).filter(Boolean).length} words • ${editableLore.length} chars` : '0 words'}
                    </span>
                </div>

                <textarea
                    value={editableLore}
                    onChange={(e) => setEditableLore(e.target.value)}
                    rows={10}
                    placeholder="Enter detailed backstory, psychological state, hidden motives, or secret interactions..."
                    className="w-full p-4 bg-[#fbf7ff] border border-[#c9b6ff] rounded-2xl text-xs sm:text-sm text-[#3b2a5a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] focus:bg-white transition-all resize-y min-h-[180px]"
                />

                <div className="flex items-center justify-between pt-1">
                    {loreSavedSuccess ? (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 size={14} /> Backstory saved to studio roster & storage!
                        </span>
                    ) : (
                        <span className="text-[11px] text-[#3b2a5a]/60">
                            You can edit this narrative directly or click apply buttons from the AI Co-Writer.
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={handleSaveManualLore}
                        disabled={isSavingLore}
                        className="px-4 py-2 bg-[#3b2a5a] hover:bg-[#2c1e44] text-[#ffd6e8] rounded-xl font-bold text-xs border border-[#ff9ec7] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        {isSavingLore ? 'Saving...' : 'Save Backstory'}
                    </button>
                </div>
            </div>

            {/* Connected Narrative Decision Lines in Decision Graph */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GitCommit size={16} className="text-[#3b2a5a]" />
                        <h3 className="text-sm font-bold text-[#3b2a5a]">
                            Connected Narrative Decision Lines ({relatedLinks.length})
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#3b2a5a]/60">Active in Graph Map</span>
                </div>

                {relatedLinks.length === 0 ? (
                    <div className="p-3.5 bg-[#fbf7ff] rounded-xl border border-dashed border-[#c9b6ff] text-xs text-[#3b2a5a]/70 text-center">
                        No decision lines currently connect to {character.name}. You can link them to other employees in the <strong>Decision Graph</strong> tab!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {relatedLinks.map((link, idx) => {
                            const fromChar = characters.find(c => c.id === link.fromCharId);
                            const toChar = characters.find(c => c.id === link.toCharId);
                            return (
                                <div 
                                    key={idx}
                                    className="p-3 bg-[#fbf7ff] hover:bg-[#ffd6e8]/20 rounded-xl border border-[#c9b6ff]/70 text-xs flex items-center justify-between gap-3 transition-colors"
                                >
                                    <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-[#3b2a5a]">
                                        <span>{fromChar?.name || 'Unknown'}</span>
                                        <ArrowRight size={12} className="text-[#ff9ec7]" />
                                        <span>{toChar?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="text-[#3b2a5a]/80 font-medium truncate max-w-[280px]">
                                        {link.stepName || link.investigationAction}
                                    </div>
                                    <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#c9b6ff] shrink-0">
                                        {link.unlocksType || 'Narrative Clue'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    // ==========================================
    // PANE 2: COLLABORATIVE AI CO-WRITER
    // ==========================================
    const renderAiCoWriterContent = () => (
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
                                onClick={() => handleSaveOpenRouterKey(openRouterKeyInput)}
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
                        onClick={() => handleSendMessage(`Run a comprehensive narrative audit on ${character.name} (${character.title}, ${character.dept}, Clearance ${character.clearance}). Check for any missing details or lore inconsistencies, propose 2 contrasting story options (Option A vs Option B), and prompt me with 3 creative questions to check.`)}
                        disabled={isAiGenerating}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#ff9ec7] to-[#ffd6e8] hover:from-[#ff8cbe] hover:to-[#ffc4de] text-[#3b2a5a] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Audit character details and prompt user with creative choices"
                    >
                        <Sparkles size={13} className="text-[#3b2a5a]" />
                        <span>🔍 Audit & Prompt Me</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendMessage(`Deepen ${character.name}'s secret backstory. Describe what anomaly they discovered in ${character.dept}, their psychological dread, and how it ties into Project Omega.`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <FileText size={12} className="text-[#ff9ec7]" /> Deepen Backstory
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendMessage(`Draft an authentic in-character memo or decrypted chat log from ${character.name} revealing suspicion about PO-4412.`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <MessageSquare size={12} className="text-[#ff9ec7]" /> Draft Voice Log
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendMessage(`Design a forensic puzzle clue for ${character.name} to hold (e.g. an unredacted financial PO-4412 slip, encrypted memory stick, or terminal override code).`)}
                        disabled={isAiGenerating}
                        className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-[11px] font-bold border border-white/15 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                        <Key size={12} className="text-[#ff9ec7]" /> Formulate Clue
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSendMessage(`Draft a chilling HR deprovisioning notice from Patricia Vance warning ${character.name} to cease unauthorized inquiries immediately.`)}
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
                                        onClick={() => handleApplyTextToLore(msg.content, 'replace')}
                                        className="px-2.5 py-1 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#ff8dbb] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Save this narrative into the character's backstory"
                                    >
                                        <FileText size={11} /> Apply as Backstory
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTextToLore(msg.content, 'append')}
                                        className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#c9b6ff] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Append to existing backstory"
                                    >
                                        ➕ Append
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTextToQuote(msg.content)}
                                        className="px-2.5 py-1 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-lg font-bold text-[11px] border border-[#c9b6ff] shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                        title="Extract quote and apply to voice snippet"
                                    >
                                        <MessageSquare size={11} /> Apply as Quote
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApplyTextToClue(msg.content)}
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
                                        onClick={() => handleSendMessage(`Change the tone of this description for ${character.name}: make them sound significantly more paranoid, sleep-deprived, and suspicious of OmniCorp surveillance.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🎭 More Paranoid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage(`Change the tone for ${character.name}: rewrite this in sterile, detached OmniCorp corporate jargon and compliant doublespeak.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🏢 Sterile Corporate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage(`Introduce an escalating dispute between ${character.name} and Sarah Kone over unredacted PO-4412 shipping manifests.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        ⚡ Dispute Sarah Kone
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage(`Change the clue to an encrypted USB flash drive hidden inside ${character.name}'s ventilation shaft.`)}
                                        className="px-2 py-0.5 bg-[#fbf7ff] hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] rounded-md font-semibold cursor-pointer transition-colors"
                                    >
                                        🔑 Switch Clue to USB
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage(`Prompt me with 3 creative questions about ${character.name}'s secrets, relationships, and fate so we can refine them together.`)}
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
                                            onClick={() => handleSendMessage(sugg)}
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
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="pt-2 border-t border-[#c9b6ff]/60 space-y-1.5 shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isAiGenerating && handleSendMessage()}
                        placeholder={`Tell AI what to change, refine, or ask for ${character.name}...`}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-[#c9b6ff] rounded-xl text-xs sm:text-sm text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] shadow-xs"
                        disabled={isAiGenerating}
                    />
                    <button
                        type="button"
                        onClick={() => handleSendMessage()}
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

    // ==========================================
    // MAIN MODAL / WORKSPACE RENDER
    // ==========================================
    const containerClasses = isFullscreen
        ? "fixed inset-0 z-50 w-screen h-screen bg-[#fbf7ff] flex flex-col overflow-hidden text-[#3b2a5a]"
        : "fixed inset-2 sm:inset-4 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2a1a40]/60 backdrop-blur-md animate-in fade-in duration-200";

    const innerClasses = isFullscreen
        ? "w-full h-full flex flex-col overflow-hidden bg-[#fbf7ff]"
        : "bg-white rounded-3xl border border-[#c9b6ff] shadow-[0_12px_48px_rgba(59,42,90,0.18)] max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden text-[#3b2a5a] animate-in zoom-in-95 duration-200";

    return (
        <div className={containerClasses}>
            <div className={innerClasses}>
                
                {/* WORKSPACE TOP HEADER */}
                <div className="p-4 sm:p-5 border-b border-[#c9b6ff]/60 bg-gradient-to-r from-[#fbf7ff] via-white to-[#ffd6e8]/25 flex items-center justify-between gap-4 shrink-0 shadow-xs">
                    
                    {/* Character Identity & Switcher */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#ffd6e8] to-[#ff9ec7]/40 border border-[#ff9ec7] flex items-center justify-center text-[#3b2a5a] shadow-xs shrink-0">
                            <User size={22} className="text-[#3b2a5a]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#3b2a5a] tracking-tight truncate">
                                    {character.name}
                                </h2>
                                <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f3e8ff] text-[#3b2a5a] border border-[#c9b6ff]">
                                    ID: {character.badgeId}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierBadge(character.tier)}`}>
                                    {character.tier}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {character.status || 'Active'}
                                </span>
                            </div>
                            <p className="text-xs text-[#3b2a5a]/80 font-medium flex items-center gap-2 truncate">
                                <span>{character.title}</span>
                                <span>•</span>
                                <span className="font-mono text-[#3b2a5a]">{character.dept}</span>
                                <span>•</span>
                                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-[#c9b6ff]">
                                    {character.clearance}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Middle: Quick Character Switcher Bar */}
                    {characters.length > 0 && onSelectCharacter && (
                        <div className="hidden md:flex items-center gap-1.5 bg-[#f3e8ff]/90 px-2 py-1 rounded-2xl border border-[#c9b6ff] shrink-0">
                            <button
                                type="button"
                                onClick={handlePrevChar}
                                className="p-1 hover:bg-white rounded-lg text-[#3b2a5a] cursor-pointer transition-colors"
                                title="Previous Character"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <select
                                value={character.id}
                                onChange={(e) => {
                                    const next = characters.find(c => c.id === e.target.value);
                                    if (next) onSelectCharacter(next);
                                }}
                                className="bg-transparent text-xs font-bold text-[#3b2a5a] cursor-pointer focus:outline-none max-w-[190px] truncate"
                            >
                                {characters.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.badgeId})
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleNextChar}
                                className="p-1 hover:bg-white rounded-lg text-[#3b2a5a] cursor-pointer transition-colors"
                                title="Next Character"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* Right: Window Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Pop out to separate browser window */}
                        <button
                            type="button"
                            onClick={handlePopOutWindow}
                            className="px-2.5 py-1.5 bg-white hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                            title="Pop out into separate browser window"
                        >
                            <ExternalLink size={13} />
                            <span className="hidden xl:inline">Pop Out Window</span>
                        </button>

                        {/* Maximize / Restore Toggle */}
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 rounded-xl bg-white hover:bg-[#ffd6e8] text-[#3b2a5a] border border-[#c9b6ff] transition-colors cursor-pointer shadow-xs"
                            title={isFullscreen ? "Restore Window Size" : "Maximize to Full Screen"}
                        >
                            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>

                        {/* Edit Data in Form */}
                        {onOpenEditForm && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenEditForm(character);
                                }}
                                className="px-2.5 py-1.5 bg-[#f3e8ff] hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                                title="Open full edit form"
                            >
                                <Edit3 size={13} />
                                <span className="hidden sm:inline">Edit Data</span>
                            </button>
                        )}

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-[#ffd6e8] text-[#3b2a5a] transition-colors cursor-pointer border border-transparent hover:border-[#ff9ec7]"
                            title="Close Dossier"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* VIEW CONTROLS & TAB SWITCHER BAR */}
                <div className="px-5 py-2.5 bg-[#f3e8ff]/80 border-b border-[#c9b6ff] flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('split')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                viewMode === 'split'
                                    ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-sm'
                                    : 'bg-white/80 hover:bg-white text-[#3b2a5a] border border-[#c9b6ff]'
                            }`}
                        >
                            <Columns size={13} /> Side-by-Side Split View
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('dossier')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                viewMode === 'dossier'
                                    ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-sm'
                                    : 'bg-white/80 hover:bg-white text-[#3b2a5a] border border-[#c9b6ff]'
                            }`}
                        >
                            <FileText size={13} /> Dossier Only
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('ai_cowriter')}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                viewMode === 'ai_cowriter'
                                    ? 'bg-gradient-to-r from-[#3b2a5a] to-[#51367d] text-[#ffd6e8] shadow-sm'
                                    : 'bg-gradient-to-r from-[#ffa8ce]/30 to-[#ffd6e8] hover:from-[#ffa8ce]/50 hover:to-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]'
                            }`}
                        >
                            <Sparkles size={13} className="text-[#ff9ec7]" /> AI Co-Writer Only
                        </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#3b2a5a]/70 hidden sm:flex items-center gap-3">
                        <span>Project Omega • Iteration 14</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-[#c9b6ff]">
                            {viewMode === 'split' ? 'Dual-Pane Workspace' : viewMode === 'dossier' ? 'Dossier Focus' : 'Co-Writer Focus'}
                        </span>
                    </div>
                </div>

                {/* WORKSPACE BODY */}
                <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-hidden bg-[#fbf7ff]/50">
                    {viewMode === 'split' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                            {/* LEFT COLUMN: LIVE DOSSIER & BACKSTORY */}
                            <div className="h-full overflow-y-auto pr-2 min-h-0">
                                {renderDossierContent()}
                            </div>

                            {/* RIGHT COLUMN: COLLABORATIVE AI CO-WRITER */}
                            <div className="h-full min-h-0 flex flex-col bg-white rounded-2xl border border-[#c9b6ff] p-4 shadow-sm overflow-hidden">
                                {renderAiCoWriterContent()}
                            </div>
                        </div>
                    )}

                    {viewMode === 'dossier' && (
                        <div className="h-full overflow-y-auto pr-2 max-w-5xl mx-auto">
                            {renderDossierContent()}
                        </div>
                    )}

                    {viewMode === 'ai_cowriter' && (
                        <div className="h-full min-h-0 flex flex-col max-w-5xl mx-auto bg-white rounded-2xl border border-[#c9b6ff] p-4 shadow-sm overflow-hidden">
                            {renderAiCoWriterContent()}
                        </div>
                    )}
                </div>

                {/* WORKSPACE FOOTER */}
                <div className="px-6 py-2.5 bg-[#fbf7ff] border-t border-[#c9b6ff]/60 flex items-center justify-between text-xs text-[#3b2a5a]/70 shrink-0">
                    <span className="font-mono text-[11px]">
                        Personnel Record #{character.badgeId} • {character.dept} • {character.clearance}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2d1f47] text-[#ffd6e8] rounded-xl font-bold transition-all cursor-pointer shadow-xs"
                    >
                        Close Workspace
                    </button>
                </div>

            </div>
        </div>
    );
}
