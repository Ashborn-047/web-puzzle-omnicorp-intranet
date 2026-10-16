import React, { useState, useEffect, useRef } from 'react';
import DossierHeader from './dossier/DossierHeader.jsx';
import DossierDetailsPane from './dossier/DossierDetailsPane.jsx';
import DossierAiCoWriter from './dossier/DossierAiCoWriter.jsx';

// Initial greeting in collaborative chat (defined at module scope for pure rendering)
const getInitialGreeting = (char) => {
    if (!char) return { role: 'assistant', content: 'No personnel dossier selected.' };
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

export default function CharacterDossierModal({
    character,
    onClose,
    onUpdateCharacter,
    onOpenEditForm,
    onSelectCharacter,
    decisionLines = [],
    characters = []
}) {
    // Window size & View layout state: 'split' | 'dossier' | 'ai_cowriter'
    const [isFullscreen, setIsFullscreen] = useState(true);
    const [viewMode, setViewMode] = useState('split');
    const [editableLore, setEditableLore] = useState(character?.loreNotes || '');
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

    const [chatMessages, setChatMessages] = useState(() => [getInitialGreeting(character)]);

    // Reset when character changes
    useEffect(() => {
        if (!character) return;
        setEditableLore(character.loreNotes || '');
        setChatMessages([getInitialGreeting(character)]);
        setAiError('');
        setAppliedSuccess('');
    }, [character]);

    useEffect(() => {
        if (viewMode === 'ai_cowriter' || viewMode === 'split') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isAiGenerating, viewMode]);

    if (!character) return null;

    // Character connections in graph
    const relatedLinks = decisionLines.filter(
        line => line.fromCharId === character.id || line.toCharId === character.id
    );

    const incomingLinks = decisionLines.filter(line => line.toCharId === character.id);
    const outgoingLinks = decisionLines.filter(line => line.fromCharId === character.id);
    const isProtagonist = character.tier === 'Protagonist' || character.id === 'char_audit04';
    const isClimaxTarget = character.id === 'char_subject882' || (character.name || '').toLowerCase().includes('subject 882');

    const characterPlotHoles = [];
    if (!isProtagonist && incomingLinks.length === 0) {
        characterPlotHoles.push({
            type: 'ORPHAN',
            title: 'Unreachable Personnel (Orphan Lead)',
            desc: 'Has 0 incoming decision lines. Players currently have no narrative path or terminal clue to discover this character in-game.'
        });
    }
    if (!isClimaxTarget && incomingLinks.length > 0 && outgoingLinks.length === 0 && character.tier !== 'Background') {
        characterPlotHoles.push({
            type: 'DEAD_END',
            title: 'Investigation Dead End',
            desc: 'Players discover this character, but there are no outgoing decision lines or leads pointing to the next suspect.'
        });
    }
    if (!character.clueHeld || character.clueHeld.length < 5) {
        characterPlotHoles.push({
            type: 'MISSING_CLUE',
            title: 'Missing Puzzle Clue',
            desc: 'No security credential pair, password, or physical puzzle item is assigned to this personnel file.'
        });
    }

    // Quick Character switching in roster
    const handlePrevChar = () => {
        if (!onSelectCharacter || characters.length === 0) return;
        const curr = characters.findIndex(c => c.id === character.id);
        const prevIndex = (curr - 1 + characters.length) % characters.length;
        onSelectCharacter(characters[prevIndex]);
    };
    const handleNextChar = () => {
        if (!onSelectCharacter || characters.length === 0) return;
        const curr = characters.findIndex(c => c.id === character.id);
        const nextIndex = (curr + 1) % characters.length;
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
            setAiError('OpenRouter API key required. Please enter your key in the top drawer to connect Nemotron 3 Ultra.');
            setIsAiGenerating(false);
            abortRef.current = null;
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
                setAiError(`OpenRouter Error: ${err.message}`);
                if (isAuthErr) {
                    setShowKeyConfig(true);
                }
            }
        } finally {
            setIsAiGenerating(false);
            abortRef.current = null;
        }
    };

    // Apply text to fields
    const handleApplyTextToLore = (text, mode = 'replace') => {
        let clean = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        clean = clean.replace(/🤝[\s\S]*?Refinements:[\s\S]*/gi, '').trim();
        clean = clean.replace(/> 🔑[\s\S]*?\n\n/gi, '').trim();

        const newLore = mode === 'replace'
            ? clean
            : (editableLore ? `${editableLore}\n\n${clean}` : clean);

        setEditableLore(newLore);
        const updated = { ...character, loreNotes: newLore };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Applied text to ${character.name}'s backstory!`);
        setTimeout(() => setAppliedSuccess(''), 2500);
    };

    const handleApplyTextToQuote = (text) => {
        const quoteMatch = text.match(/"([^"]{10,200})"/);
        const quoteToUse = quoteMatch ? quoteMatch[1] : text.slice(0, 140);
        const updated = { ...character, messageSnippet: quoteToUse };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated recorded voice quote!`);
        setTimeout(() => setAppliedSuccess(''), 2500);
    };

    const handleApplyTextToClue = (text) => {
        const lines = text.split('\n').filter(l => l.toLowerCase().includes('clue') || l.toLowerCase().includes('key') || l.toLowerCase().includes('password') || l.toLowerCase().includes('usb'));
        const clueToUse = lines.length > 0 ? lines[0].replace(/^[*-•\s]+/, '').slice(0, 160) : text.slice(0, 160);
        const updated = { ...character, clueHeld: clueToUse };
        onUpdateCharacter(updated);
        setAppliedSuccess(`Updated forensic clue!`);
        setTimeout(() => setAppliedSuccess(''), 2500);
    };

    const containerClasses = isFullscreen
        ? "fixed inset-0 z-50 w-screen h-screen bg-[#fbf7ff] flex flex-col overflow-hidden text-[#3b2a5a]"
        : "fixed inset-2 sm:inset-4 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2a1a40]/60 backdrop-blur-md animate-in fade-in duration-200";

    const innerClasses = isFullscreen
        ? "w-full h-full flex flex-col overflow-hidden bg-[#fbf7ff]"
        : "bg-white rounded-3xl border border-[#c9b6ff] shadow-[0_12px_48px_rgba(59,42,90,0.18)] max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden text-[#3b2a5a] animate-in zoom-in-95 duration-200";

    return (
        <div className={containerClasses}>
            <div className={innerClasses}>
                {/* WORKSPACE HEADER */}
                <DossierHeader
                    character={character}
                    characters={characters}
                    onPrevChar={handlePrevChar}
                    onNextChar={handleNextChar}
                    onSelectCharacter={onSelectCharacter}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isFullscreen={isFullscreen}
                    setIsFullscreen={setIsFullscreen}
                    onPopOutWindow={handlePopOutWindow}
                    onOpenEditForm={onOpenEditForm}
                    onClose={onClose}
                />

                {/* WORKSPACE BODY */}
                <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-hidden bg-[#fbf7ff]/50">
                    {viewMode === 'split' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
                            {/* LEFT COLUMN: LIVE DOSSIER & BACKSTORY */}
                            <div className="h-full overflow-y-auto pr-2 min-h-0">
                                <DossierDetailsPane
                                    character={character}
                                    characters={characters}
                                    characterPlotHoles={characterPlotHoles}
                                    relatedLinks={relatedLinks}
                                    editableLore={editableLore}
                                    setEditableLore={setEditableLore}
                                    isSavingLore={isSavingLore}
                                    loreSavedSuccess={loreSavedSuccess}
                                    onSaveManualLore={handleSaveManualLore}
                                    onFixWithAi={(ph) => {
                                        setViewMode('split');
                                        handleSendMessage(`Let's resolve this continuity flaw for ${character.name}: ${ph.title}. Propose an immediate resolution that connects smoothly with our OmniCorp ARG puzzle canon.`);
                                    }}
                                    onCopyClue={() => {
                                        navigator.clipboard.writeText(character.clueHeld || '');
                                        setAppliedSuccess('Clue copied to clipboard!');
                                        setTimeout(() => setAppliedSuccess(''), 2000);
                                    }}
                                    onCopyQuote={() => {
                                        navigator.clipboard.writeText(character.messageSnippet || '');
                                        setAppliedSuccess('Quote copied to clipboard!');
                                        setTimeout(() => setAppliedSuccess(''), 2000);
                                    }}
                                />
                            </div>

                            {/* RIGHT COLUMN: COLLABORATIVE AI CO-WRITER */}
                            <div className="h-full min-h-0 flex flex-col bg-white rounded-2xl border border-[#c9b6ff] p-4 shadow-sm overflow-hidden">
                                <DossierAiCoWriter
                                    character={character}
                                    showKeyConfig={showKeyConfig}
                                    setShowKeyConfig={setShowKeyConfig}
                                    openRouterKeyInput={openRouterKeyInput}
                                    setOpenRouterKeyInput={setOpenRouterKeyInput}
                                    onSaveOpenRouterKey={handleSaveOpenRouterKey}
                                    onSendMessage={handleSendMessage}
                                    isAiGenerating={isAiGenerating}
                                    appliedSuccess={appliedSuccess}
                                    setAppliedSuccess={setAppliedSuccess}
                                    chatMessages={chatMessages}
                                    aiError={aiError}
                                    setAiError={setAiError}
                                    chatInput={chatInput}
                                    setChatInput={setChatInput}
                                    messagesEndRef={messagesEndRef}
                                    onApplyTextToLore={handleApplyTextToLore}
                                    onApplyTextToQuote={handleApplyTextToQuote}
                                    onApplyTextToClue={handleApplyTextToClue}
                                />
                            </div>
                        </div>
                    )}

                    {viewMode === 'dossier' && (
                        <div className="h-full overflow-y-auto max-w-4xl mx-auto pr-2">
                            <DossierDetailsPane
                                character={character}
                                characters={characters}
                                characterPlotHoles={characterPlotHoles}
                                relatedLinks={relatedLinks}
                                editableLore={editableLore}
                                setEditableLore={setEditableLore}
                                isSavingLore={isSavingLore}
                                loreSavedSuccess={loreSavedSuccess}
                                onSaveManualLore={handleSaveManualLore}
                                onFixWithAi={(ph) => {
                                    setViewMode('split');
                                    handleSendMessage(`Let's resolve this continuity flaw for ${character.name}: ${ph.title}. Propose an immediate resolution that connects smoothly with our OmniCorp ARG puzzle canon.`);
                                }}
                                onCopyClue={() => {
                                    navigator.clipboard.writeText(character.clueHeld || '');
                                    setAppliedSuccess('Clue copied to clipboard!');
                                    setTimeout(() => setAppliedSuccess(''), 2000);
                                }}
                                onCopyQuote={() => {
                                    navigator.clipboard.writeText(character.messageSnippet || '');
                                    setAppliedSuccess('Quote copied to clipboard!');
                                    setTimeout(() => setAppliedSuccess(''), 2000);
                                }}
                            />
                        </div>
                    )}

                    {viewMode === 'ai_cowriter' && (
                        <div className="h-full max-w-4xl mx-auto flex flex-col bg-white rounded-3xl border border-[#c9b6ff] p-4 sm:p-6 shadow-sm overflow-hidden">
                            <DossierAiCoWriter
                                character={character}
                                showKeyConfig={showKeyConfig}
                                setShowKeyConfig={setShowKeyConfig}
                                openRouterKeyInput={openRouterKeyInput}
                                setOpenRouterKeyInput={setOpenRouterKeyInput}
                                onSaveOpenRouterKey={handleSaveOpenRouterKey}
                                onSendMessage={handleSendMessage}
                                isAiGenerating={isAiGenerating}
                                appliedSuccess={appliedSuccess}
                                setAppliedSuccess={setAppliedSuccess}
                                chatMessages={chatMessages}
                                aiError={aiError}
                                setAiError={setAiError}
                                chatInput={chatInput}
                                setChatInput={setChatInput}
                                messagesEndRef={messagesEndRef}
                                onApplyTextToLore={handleApplyTextToLore}
                                onApplyTextToQuote={handleApplyTextToQuote}
                                onApplyTextToClue={handleApplyTextToClue}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
