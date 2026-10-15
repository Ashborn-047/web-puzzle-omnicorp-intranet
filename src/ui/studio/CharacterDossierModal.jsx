import React, { useState, useEffect, useRef } from 'react';
import { 
    X, Sparkles, Send, Bot, RefreshCw, Key, MessageSquare, 
    FileText, User, Shield, Tag, Building2, CheckCircle2, 
    Copy, Edit3, ArrowRight, GitCommit, AlertTriangle, ChevronRight
} from 'lucide-react';
import { generateOmniCorpSimulatedResponse } from './omnicorpSimulator.js';

export default function CharacterDossierModal({
    character,
    onClose,
    onUpdateCharacter,
    onOpenEditForm,
    decisionLines = [],
    characters = []
}) {
    if (!character) return null;

    const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'ai_cowriter'
    const [editableLore, setEditableLore] = useState(character.loreNotes || '');
    const [isSavingLore, setIsSavingLore] = useState(false);
    const [loreSavedSuccess, setLoreSavedSuccess] = useState(false);

    // AI Co-Writer states
    const [customPrompt, setCustomPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [aiReasoning, setAiReasoning] = useState('');
    const [aiError, setAiError] = useState('');
    const [appliedSuccess, setAppliedSuccess] = useState('');
    const abortRef = useRef(null);

    useEffect(() => {
        setEditableLore(character.loreNotes || '');
        setAiResponse('');
        setAiReasoning('');
        setAiError('');
        setAppliedSuccess('');
    }, [character.id]);

    // Character connections in graph
    const relatedLinks = decisionLines.filter(
        line => line.fromCharId === character.id || line.toCharId === character.id
    );

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

    // AI Generation for Character Description / Story
    const handleRunAiPrompt = async (promptDirective) => {
        const directiveText = promptDirective || customPrompt;
        if (!directiveText.trim()) return;

        setIsAiGenerating(true);
        setAiError('');
        setAiResponse('');
        setAiReasoning('');
        setAppliedSuccess('');
        setActiveTab('ai_cowriter');

        abortRef.current = new AbortController();

        const savedProvider = localStorage.getItem('omnicorp_ai_provider') || 'openrouter';
        const savedNvidiaKey = localStorage.getItem('omnicorp_nemotron_api_key') || import.meta.env.VITE_NVIDIA_API_KEY || '';
        const savedOpenRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
        const selectedModel = localStorage.getItem('omnicorp_nemotron_model') || 'nvidia/nemotron-3-ultra-550b-a55b:free';

        const apiKey = savedProvider === 'openrouter' ? savedOpenRouterKey : savedNvidiaKey;

        // If offline simulator selected or no keys available
        if (savedProvider === 'builtin' || (!apiKey && !import.meta.env.DEV)) {
            try {
                await new Promise(r => setTimeout(r, 400));
                const simText = generateOmniCorpSimulatedResponse(
                    `Character ${character.name} in ${character.dept}. ${directiveText}`,
                    { characters, decisionLines }
                );
                setAiResponse(simText);
            } catch (err) {
                setAiError(err.message);
            } finally {
                setIsAiGenerating(false);
            }
            return;
        }

        try {
            const systemPrompt = `You are the OmniCorp Narrative Co-Writer and Worldbuilding Assistant for the cosmic horror ARG puzzle game "OmniCorp Intranet".
You are collaborating on the detailed character dossier for:
- Name: ${character.name} (Badge ID: ${character.badgeId})
- Corporate Role: ${character.title}
- Department: ${character.dept}
- Clearance Level: ${character.clearance}
- Story Tier: ${character.tier}
- Clue/Credential Held: ${character.clueHeld || 'None'}
- Current Quote/Memo: ${character.messageSnippet || 'None'}
- Existing Lore Notes: ${character.loreNotes || 'None'}

Provide rich, atmospheric narrative text with psychological depth, corporate dread, and sharp forensic ARG puzzle details. Format cleanly with markdown.`;

            const payloadBody = JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: directiveText }
                ],
                temperature: 0.7,
                max_tokens: 2048,
                stream: true
            });

            let endpoints = [];
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            };

            if (savedProvider === 'openrouter') {
                endpoints = ['https://openrouter.ai/api/v1/chat/completions'];
                headers['HTTP-Referer'] = window.location.origin;
                headers['X-Title'] = 'OmniCorp Intranet Studio';
            } else {
                const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
                if (import.meta.env.DEV) {
                    endpoints = [
                        `${baseUrl}/api/nvidia/v1/chat/completions`,
                        '/api/nvidia/v1/chat/completions'
                    ];
                } else {
                    endpoints = [
                        `${baseUrl}/api/nvidia/v1/chat/completions`,
                        'https://integrate.api.nvidia.com/v1/chat/completions'
                    ];
                }
            }

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
                throw new Error(lastErr?.message || 'Could not reach AI provider endpoint.');
            }

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
                                    setAiResponse(accContent.replace(/<think>[\s\S]*?<\/think>/g, ''));
                                }
                                if (delta?.reasoning_content) {
                                    accReasoning += delta.reasoning_content;
                                    setAiReasoning(accReasoning);
                                }
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
                setAiResponse(accContent);
                setAiReasoning(accReasoning);
            }

            if (!accContent && accReasoning) {
                setAiResponse(accReasoning);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setAiError(err.message);
            }
        } finally {
            setIsAiGenerating(false);
            abortRef.current = null;
        }
    };

    // Apply AI generation directly to character
    const handleApplyToBackstory = (mode = 'replace') => {
        if (!aiResponse.trim()) return;
        const newLore = mode === 'append' 
            ? `${editableLore}\n\n${aiResponse.trim()}`
            : aiResponse.trim();
        setEditableLore(newLore);
        const updated = {
            ...character,
            loreNotes: newLore
        };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Saved to ${character.name}'s lore notes!`);
        setTimeout(() => setAppliedSuccess(''), 3000);
    };

    const handleApplyToQuote = () => {
        if (!aiResponse.trim()) return;
        // Strip markdown quotes or code blocks if present
        const cleaned = aiResponse
            .replace(/^["'>\s]+/, '')
            .replace(/["'\s]+$/, '')
            .split('\n')[0];
        const updated = {
            ...character,
            messageSnippet: cleaned
        };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated voice quote for ${character.name}!`);
        setTimeout(() => setAppliedSuccess(''), 3000);
    };

    const handleApplyToClue = () => {
        if (!aiResponse.trim()) return;
        const updated = {
            ...character,
            clueHeld: aiResponse.trim().split('\n')[0]
        };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated clue held for ${character.name}!`);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2a1a40]/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#c9b6ff] shadow-[0_12px_48px_rgba(59,42,90,0.18)] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#3b2a5a] animate-in zoom-in-95 duration-200">
                
                {/* MODAL HEADER */}
                <div className="p-5 sm:p-6 border-b border-[#c9b6ff]/60 bg-gradient-to-r from-[#fbf7ff] via-white to-[#ffd6e8]/20 flex items-start justify-between gap-4 shrink-0">
                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#ffd6e8] to-[#ff9ec7]/40 border border-[#ff9ec7] flex items-center justify-center text-[#3b2a5a] shadow-sm shrink-0 mt-0.5">
                            <User size={24} className="text-[#3b2a5a]" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#3b2a5a] tracking-tight">
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
                            <p className="text-xs sm:text-sm text-[#3b2a5a]/80 font-medium flex items-center gap-2">
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

                    <div className="flex items-center gap-2 shrink-0">
                        {onOpenEditForm && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onOpenEditForm(character);
                                }}
                                className="px-3 py-1.5 bg-[#f3e8ff] hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                                title="Open full edit form"
                            >
                                <Edit3 size={13} />
                                <span className="hidden sm:inline">Edit Data</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-[#ffd6e8]/60 text-[#3b2a5a] transition-colors cursor-pointer border border-transparent hover:border-[#ff9ec7]"
                            title="Close Dossier"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* TAB SWITCHER */}
                <div className="px-6 py-2.5 bg-[#f3e8ff]/80 border-b border-[#c9b6ff] flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('dossier')}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'dossier'
                                    ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-sm'
                                    : 'bg-white/80 hover:bg-white text-[#3b2a5a] border border-[#c9b6ff]'
                            }`}
                        >
                            <FileText size={13} /> Detailed Dossier & Lore
                        </button>
                        <button
                            onClick={() => setActiveTab('ai_cowriter')}
                            className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'ai_cowriter'
                                    ? 'bg-gradient-to-r from-[#3b2a5a] to-[#51367d] text-[#ffd6e8] shadow-sm'
                                    : 'bg-gradient-to-r from-[#ffa8ce]/30 to-[#ffd6e8] hover:from-[#ffa8ce]/50 hover:to-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]'
                            }`}
                        >
                            <Sparkles size={13} className="text-[#ff9ec7]" /> AI Story & Description Co-Writer
                        </button>
                    </div>

                    <div className="text-[11px] font-mono text-[#3b2a5a]/70 hidden sm:block">
                        Project Omega • Iteration 14
                    </div>
                </div>

                {/* MODAL BODY */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#fbf7ff]/50">
                    
                    {/* TAB 1: DETAILED DOSSIER */}
                    {activeTab === 'dossier' && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            
                            {/* Clue & Voice Snippet Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Clue / Credential */}
                                <div className="bg-gradient-to-br from-[#fff5f9] to-[#ffd6e8]/50 p-4 rounded-2xl border border-[#ff9ec7]/80 shadow-[0_2px_8px_rgba(255,158,199,0.15)] flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                                            <Key size={14} className="text-[#ff70aa]" />
                                            <span>Clue / Credential Held</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-[#3b2a5a] leading-relaxed">
                                            {character.clueHeld || 'No forensic clue or security credential specified for this employee.'}
                                        </p>
                                    </div>
                                    <div className="mt-3 pt-2.5 border-t border-[#ff9ec7]/40 flex items-center justify-between text-[10px] text-[#3b2a5a]/70 font-mono">
                                        <span>Security clearance: {character.clearance}</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(character.clueHeld || '');
                                                setAppliedSuccess('Clue copied to clipboard!');
                                                setTimeout(() => setAppliedSuccess(''), 2000);
                                            }}
                                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Copy size={11} /> Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Voice / Chat Snippet */}
                                <div className="bg-white p-4 rounded-2xl border border-[#c9b6ff] shadow-sm flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold uppercase font-mono text-[#3b2a5a] mb-2">
                                            <MessageSquare size={14} className="text-[#7c5cb7]" />
                                            <span>Recorded Voice / Chat Residue</span>
                                        </div>
                                        <blockquote className="text-xs sm:text-sm text-[#3b2a5a] italic leading-relaxed pl-3 border-l-2 border-[#ff9ec7]">
                                            "{character.messageSnippet || 'No recorded audio log or terminal chat residue discovered in this iteration.'}"
                                        </blockquote>
                                    </div>
                                    <div className="mt-3 pt-2.5 border-t border-[#c9b6ff]/40 flex items-center justify-between text-[10px] text-[#3b2a5a]/70 font-mono">
                                        <span>Channel: #{character.dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}-internal</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(character.messageSnippet || '');
                                                setAppliedSuccess('Quote copied to clipboard!');
                                                setTimeout(() => setAppliedSuccess(''), 2000);
                                            }}
                                            className="hover:text-[#3b2a5a] font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Copy size={11} /> Copy
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Full Backstory & Lore Notes Editor */}
                            <div className="bg-white p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-[#3b2a5a]" />
                                        <h3 className="text-sm font-bold text-[#3b2a5a]">
                                            Character Backstory, Secret Motives & Lore Notes
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('ai_cowriter')}
                                        className="text-[11px] font-bold text-[#3b2a5a] bg-[#ffd6e8]/60 hover:bg-[#ffd6e8] px-2.5 py-1 rounded-xl border border-[#ff9ec7] flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <Sparkles size={12} className="text-[#ff70aa]" />
                                        <span>Co-Write with AI</span>
                                    </button>
                                </div>

                                <textarea
                                    value={editableLore}
                                    onChange={(e) => setEditableLore(e.target.value)}
                                    rows={5}
                                    placeholder="Enter detailed backstory, psychological state, hidden motives, or secret interactions..."
                                    className="w-full p-3.5 bg-[#fbf7ff] border border-[#c9b6ff] rounded-xl text-xs sm:text-sm text-[#3b2a5a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#ff9ec7] focus:bg-white transition-all resize-y"
                                />

                                <div className="flex items-center justify-between pt-1">
                                    {loreSavedSuccess ? (
                                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in">
                                            <CheckCircle2 size={14} /> Backstory saved to studio roster!
                                        </span>
                                    ) : <span className="text-[11px] text-[#3b2a5a]/60">You can edit this narrative description directly or use the AI Co-Writer tab above.</span>}

                                    <button
                                        onClick={handleSaveManualLore}
                                        disabled={isSavingLore}
                                        className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2c1e44] text-[#ffd6e8] rounded-xl font-bold text-xs border border-[#ff9ec7] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                        {isSavingLore ? 'Saving...' : 'Save Backstory'}
                                    </button>
                                </div>
                            </div>

                            {/* Connected Story Pathways in Decision Graph */}
                            <div className="bg-white p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-3">
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
                    )}

                    {/* TAB 2: AI STORY & DESCRIPTION CO-WRITER */}
                    {activeTab === 'ai_cowriter' && (
                        <div className="space-y-5 animate-in fade-in duration-200">
                            
                            {/* AI Action Header */}
                            <div className="bg-gradient-to-r from-[#3b2a5a] to-[#4e3478] p-4 sm:p-5 rounded-2xl text-white shadow-md space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ffd6e8] mb-1">
                                            <Sparkles size={14} className="text-[#ff9ec7]" />
                                            <span>AI NARRATIVE ASSISTANT</span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold">
                                            Co-Write & Expand Description for {character.name}
                                        </h3>
                                        <p className="text-xs text-[#ffd6e8]/80 leading-relaxed max-w-xl">
                                            Choose an instant story prompt below or enter your own custom direction. The AI will formulate lore canon that you can apply with 1-click!
                                        </p>
                                    </div>
                                </div>

                                {/* Quick AI Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/20">
                                    <button
                                        type="button"
                                        onClick={() => handleRunAiPrompt(`Deepen the secret backstory of ${character.name} (${character.title} in ${character.dept}). Describe what they witnessed in iteration 14 of the loop, their hidden trauma or fear of HR deprovisioning, and their secret link to Project Omega.`)}
                                        disabled={isAiGenerating}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-xs font-bold text-left border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <Sparkles size={14} className="text-[#ff9ec7] shrink-0" />
                                        <span>Deepen Secret Backstory & Motives</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRunAiPrompt(`Draft a tense, in-character decrypted chat or audio log snippet for ${character.name} revealing an anomaly they discovered about PO-4412 or Sector 7.`)}
                                        disabled={isAiGenerating}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-xs font-bold text-left border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <MessageSquare size={14} className="text-[#ff9ec7] shrink-0" />
                                        <span>Draft Dialogue Log or Audio Residue</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRunAiPrompt(`Design a forensic puzzle clue for ${character.name} to hold (e.g. an unredacted financial PO-4412 manifest, a scrambled terminal passcode, or a classified memo).`)}
                                        disabled={isAiGenerating}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-xs font-bold text-left border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <Key size={14} className="text-[#ff9ec7] shrink-0" />
                                        <span>Create Forensic Puzzle Clue</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleRunAiPrompt(`Draft a chilling, sterile corporate HR 'Resource Deprovisioning' warning memo from Patricia Vance flagging ${character.name} for memory scrub or reassignment to Sub-level 3.`)}
                                        disabled={isAiGenerating}
                                        className="p-2.5 bg-white/10 hover:bg-white/20 text-[#ffd6e8] rounded-xl text-xs font-bold text-left border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        <AlertTriangle size={14} className="text-[#ff9ec7] shrink-0" />
                                        <span>Write HR Deprovisioning Warning</span>
                                    </button>
                                </div>
                            </div>

                            {/* Custom Prompt Bar */}
                            <div className="flex gap-2 bg-white p-2 rounded-2xl border border-[#c9b6ff] shadow-sm">
                                <input
                                    type="text"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRunAiPrompt()}
                                    placeholder={`Ask AI anything about ${character.name} (e.g., "Describe their interaction with Sarah Kone")...`}
                                    className="flex-1 px-3 py-2 text-xs sm:text-sm text-[#3b2a5a] placeholder-[#3b2a5a]/40 bg-transparent focus:outline-none"
                                />
                                <button
                                    onClick={() => handleRunAiPrompt()}
                                    disabled={isAiGenerating || !customPrompt.trim()}
                                    className="px-4 py-2 bg-[#3b2a5a] hover:bg-[#2a1a40] text-[#ffd6e8] font-bold text-xs rounded-xl border border-[#ff9ec7] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                    {isAiGenerating ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
                                    <span>Generate</span>
                                </button>
                            </div>

                            {/* Notification / Toast */}
                            {appliedSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                                    <CheckCircle2 size={15} />
                                    <span>{appliedSuccess}</span>
                                </div>
                            )}

                            {/* Error Banner */}
                            {aiError && (
                                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs leading-relaxed">
                                    <strong>AI Request Notice:</strong> {aiError}
                                </div>
                            )}

                            {/* Generated Output Box */}
                            {(aiResponse || isAiGenerating) && (
                                <div className="bg-white p-5 rounded-2xl border border-[#c9b6ff] shadow-sm space-y-4 animate-in fade-in">
                                    <div className="flex items-center justify-between pb-2 border-b border-[#c9b6ff]/50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-[#3b2a5a]">
                                            <Bot size={15} className="text-[#3b2a5a]" />
                                            <span>Generated Narrative Proposal</span>
                                            {isAiGenerating && (
                                                <span className="text-[10px] font-mono text-purple-700 font-bold flex items-center gap-1">
                                                    <RefreshCw size={11} className="animate-spin" /> Streaming...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reasoning Drawer if available */}
                                    {aiReasoning && (
                                        <details className="text-[11px] text-[#3b2a5a]/70 bg-[#f3e8ff]/60 border border-[#c9b6ff]/60 rounded-xl p-2 cursor-pointer group">
                                            <summary className="font-mono font-bold text-[10px] text-[#3b2a5a]/80 select-none flex items-center gap-1.5 list-none">
                                                <span>💭</span>
                                                <span>AI Reasoning Chain</span>
                                            </summary>
                                            <div className="mt-1.5 pt-1.5 border-t border-[#c9b6ff]/40 text-[#3b2a5a]/80 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                                                {aiReasoning}
                                            </div>
                                        </details>
                                    )}

                                    {/* Content display */}
                                    <div className="text-xs sm:text-sm text-[#3b2a5a] leading-relaxed whitespace-pre-wrap bg-[#fbf7ff] p-4 rounded-xl border border-[#c9b6ff]/60">
                                        {aiResponse || 'Synthesizing narrative...'}
                                    </div>

                                    {/* 1-Click Apply Buttons */}
                                    {!isAiGenerating && aiResponse && (
                                        <div className="pt-2 flex flex-wrap items-center gap-2">
                                            <button
                                                onClick={() => handleApplyToBackstory('replace')}
                                                className="px-3.5 py-1.5 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold text-xs border border-[#ff8dbb] shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                title="Save this text as the character's main backstory"
                                            >
                                                <FileText size={13} /> Replace Backstory
                                            </button>
                                            <button
                                                onClick={() => handleApplyToBackstory('append')}
                                                className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl font-bold text-xs border border-[#c9b6ff] shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                title="Append this text to the end of existing lore"
                                            >
                                                ➕ Append to Backstory
                                            </button>
                                            <button
                                                onClick={handleApplyToQuote}
                                                className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl font-bold text-xs border border-[#c9b6ff] shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                title="Use the first line as their recorded quote snippet"
                                            >
                                                <MessageSquare size={13} /> Set as Quote
                                            </button>
                                            <button
                                                onClick={handleApplyToClue}
                                                className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl font-bold text-xs border border-[#c9b6ff] shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                                                title="Use the first line as their clue held"
                                            >
                                                <Key size={13} /> Set as Clue
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(aiResponse);
                                                    setAppliedSuccess('Copied to clipboard!');
                                                    setTimeout(() => setAppliedSuccess(''), 2000);
                                                }}
                                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#3b2a5a]/70 hover:text-[#3b2a5a] rounded-xl font-bold text-xs border border-[#c9b6ff] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                            >
                                                <Copy size={13} /> Copy Text
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                </div>

                {/* MODAL FOOTER */}
                <div className="px-6 py-3.5 bg-[#fbf7ff] border-t border-[#c9b6ff]/60 flex items-center justify-between text-xs text-[#3b2a5a]/70 shrink-0">
                    <span className="font-mono text-[11px]">
                        Badge #{character.badgeId} • {character.dept}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-[#3b2a5a] hover:bg-[#2d1f47] text-[#ffd6e8] rounded-xl font-bold transition-all cursor-pointer shadow-xs"
                    >
                        Close Dossier
                    </button>
                </div>

            </div>
        </div>
    );
}
