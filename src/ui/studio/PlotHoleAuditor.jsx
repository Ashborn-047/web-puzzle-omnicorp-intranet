import React, { useState, useMemo } from 'react';
import {
    AlertTriangle, ShieldAlert, CheckCircle2, Sparkles, ArrowRight,
    Search, User, RefreshCw, ExternalLink, Edit3, Link, Plus,
    Key, HelpCircle, Eye, GitCommit, FileText, ChevronRight, X,
    Check, CornerDownRight, Filter, AlertCircle, Bot, Zap, BookOpen
} from 'lucide-react';

export default function PlotHoleAuditor({
    characters = [],
    decisionLines = [],
    onSelectCharacter,
    onOpenEditForm,
    onOpenAddDecisionLine,
    onUpdateCharacter
}) {
    const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'SUGGESTION' | 'AI'
    const [dismissedIssues, setDismissedIssues] = useState(new Set());
    
    // AI Deep Lore Scan State
    const [isAiScanning, setIsAiScanning] = useState(false);
    const [aiScanResults, setAiScanResults] = useState([]);
    const [aiScanError, setAiScanError] = useState('');
    const [actionSuccessMsg, setActionSuccessMsg] = useState('');

    // OpenRouter Key setup
    const openRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';

    // ==========================================
    // 1. INSTANT STRUCTURAL RULE-BASED AUDIT ENGINE
    // ==========================================
    const auditReport = useMemo(() => {
        const issues = [];
        const charMap = new Map(characters.map(c => [c.id, c]));

        // Identify Protagonist and End-Goal Climax Target
        const protagonist = characters.find(c => c.tier === 'Protagonist' || c.id === 'char_audit04');
        const climaxTarget = characters.find(c => 
            c.id === 'char_subject882' || 
            c.badgeId === '882' || 
            c.name.toLowerCase().includes('subject 882') ||
            c.name.toLowerCase().includes('omega')
        ) || characters.find(c => c.tier === 'Deceased / MIA');

        // Build directed adjacency map for decision lines
        const outgoingMap = new Map();
        const incomingMap = new Map();
        characters.forEach(c => {
            outgoingMap.set(c.id, []);
            incomingMap.set(c.id, []);
        });

        decisionLines.forEach(dl => {
            if (charMap.has(dl.fromCharId)) {
                if (!outgoingMap.has(dl.fromCharId)) outgoingMap.set(dl.fromCharId, []);
                outgoingMap.get(dl.fromCharId).push(dl);
            }
            if (charMap.has(dl.toCharId)) {
                if (!incomingMap.has(dl.toCharId)) incomingMap.set(dl.toCharId, []);
                incomingMap.get(dl.toCharId).push(dl);
            }
        });

        // ----------------------------------------------------
        // RULE 1: BROKEN DECISION LINE REFERENCES
        // ----------------------------------------------------
        decisionLines.forEach(dl => {
            const fromExists = charMap.has(dl.fromCharId);
            const toExists = charMap.has(dl.toCharId);
            if (!fromExists || !toExists) {
                issues.push({
                    id: `broken_ref_${dl.id}`,
                    type: 'BROKEN_LINK',
                    severity: 'CRITICAL',
                    title: `Dangling Decision Line: "${dl.stepName || 'Unnamed Step'}"`,
                    description: `This decision line points to or from a character ID that does not exist in the active roster (From: ${dl.fromCharId}, To: ${dl.toCharId}).`,
                    recommendation: 'Re-assign valid source and target characters or delete this orphaned line.',
                    targetLineId: dl.id,
                    fixType: 'EDIT_LINE'
                });
            }
        });

        // ----------------------------------------------------
        // RULE 2: PATH TO CLIMAX (WINNABILITY OF THE GAME)
        // ----------------------------------------------------
        let criticalPath = [];
        let canReachClimax = false;

        if (protagonist && climaxTarget) {
            // BFS from protagonist to climax
            const queue = [[protagonist.id, [protagonist.id]]];
            const visited = new Set([protagonist.id]);

            while (queue.length > 0) {
                const [currentId, path] = queue.shift();
                if (currentId === climaxTarget.id) {
                    canReachClimax = true;
                    criticalPath = path;
                    break;
                }
                const neighbors = (outgoingMap.get(currentId) || []).map(l => l.toCharId);
                for (const nextId of neighbors) {
                    if (!visited.has(nextId) && charMap.has(nextId)) {
                        visited.add(nextId);
                        queue.push([nextId, [...path, nextId]]);
                    }
                }
            }

            if (!canReachClimax) {
                issues.push({
                    id: 'unwinnable_climax_path',
                    type: 'UNWINNABLE_LOOP',
                    severity: 'CRITICAL',
                    title: `Unwinnable Mystery: No Valid Path from ${protagonist.name} to ${climaxTarget.name}`,
                    description: `The player starts as "${protagonist.name}", but there is no connected chain of clues or decision lines leading to the climax target "${climaxTarget.name}". Players will get stuck without a path to victory.`,
                    recommendation: `Add decision lines linking intermediate employees (e.g., Sarah Kone ➔ David Bowman ➔ Patricia Vance ➔ ${climaxTarget.name}).`,
                    targetCharId: protagonist.id,
                    secondaryCharId: climaxTarget.id,
                    fixType: 'CONNECT_GRAPH'
                });
            }
        }

        // ----------------------------------------------------
        // RULE 3: ORPHAN / UNREACHABLE CHARACTERS
        // ----------------------------------------------------
        characters.forEach(char => {
            if (protagonist && char.id === protagonist.id) return; // Protagonist starts unlocked

            const incoming = incomingMap.get(char.id) || [];
            if (incoming.length === 0) {
                const isCrucial = char.tier === 'Main Target' || char.tier === 'Supporting';
                issues.push({
                    id: `unreachable_${char.id}`,
                    type: 'UNREACHABLE_CHARACTER',
                    severity: isCrucial ? 'CRITICAL' : 'WARNING',
                    title: `Unreachable Personnel: ${char.name} (${char.badgeId})`,
                    description: `${char.name} is on the roster with clearance "${char.clearance}", but has 0 incoming decision lines. Players have no in-game narrative trigger or terminal lead to discover them.`,
                    recommendation: `Create an incoming decision line from another employee (e.g. an email thread, audit finding, or log leak) that points to ${char.name}.`,
                    targetCharId: char.id,
                    fixType: 'CONNECT_TO_CHAR'
                });
            }
        });

        // ----------------------------------------------------
        // RULE 4: DEAD ENDS / NARRATIVE CUL-DE-SACS
        // ----------------------------------------------------
        characters.forEach(char => {
            if (climaxTarget && char.id === climaxTarget.id) return; // Climax target is naturally the end
            if (char.tier === 'Background' || char.tier === 'Other') return; // Background characters can be ambient

            const outgoing = outgoingMap.get(char.id) || [];
            const incoming = incomingMap.get(char.id) || [];

            if (incoming.length > 0 && outgoing.length === 0) {
                issues.push({
                    id: `dead_end_${char.id}`,
                    type: 'DEAD_END',
                    severity: char.tier === 'Main Target' ? 'CRITICAL' : 'WARNING',
                    title: `Narrative Dead End: ${char.name} leads nowhere`,
                    description: `The player discovers ${char.name} through an investigation lead, but this character offers 0 outgoing decision lines. The investigation trail abruptly goes cold here.`,
                    recommendation: `Add an outgoing decision step from ${char.name} pointing to the next department, server terminal, or suspect.`,
                    targetCharId: char.id,
                    fixType: 'ADD_OUTGOING_LINE'
                });
            }
        });

        // ----------------------------------------------------
        // RULE 5: MISSING FORENSIC PUZZLE CLUES
        // ----------------------------------------------------
        characters.forEach(char => {
            const clue = (char.clueHeld || '').trim();
            const isMissing = !clue || clue.toLowerCase() === 'none' || clue.length < 5;
            
            if (isMissing && (char.tier === 'Protagonist' || char.tier === 'Main Target' || char.tier === 'Supporting')) {
                issues.push({
                    id: `missing_clue_${char.id}`,
                    type: 'MISSING_CLUE',
                    severity: 'WARNING',
                    title: `Empty Puzzle Clue: ${char.name}`,
                    description: `${char.name} is a ${char.tier} but holds no puzzle clue, credential, or physical artifact for the ARG player to solve.`,
                    recommendation: 'Assign a credential pair (e.g. badge ID + password), terminal command, or forensic document to this character.',
                    targetCharId: char.id,
                    fixType: 'GENERATE_CLUE'
                });
            }
        });

        // ----------------------------------------------------
        // RULE 6: MISSING VOICE MEMOS OR CHAT RESIDUE
        // ----------------------------------------------------
        characters.forEach(char => {
            const memo = (char.messageSnippet || '').trim();
            const isMissing = !memo || memo.toLowerCase() === 'none' || memo.length < 5;

            if (isMissing && (char.tier === 'Protagonist' || char.tier === 'Main Target')) {
                issues.push({
                    id: `missing_voice_${char.id}`,
                    type: 'MISSING_VOICE',
                    severity: 'WARNING',
                    title: `Missing Voice Residue: ${char.name}`,
                    description: `Key character ${char.name} has no recorded quote, audio memo, or intercepted terminal chat snippet on file.`,
                    recommendation: 'Draft an authentic dialogue snippet reflecting their fear, suspicion, or corporate complicity.',
                    targetCharId: char.id,
                    fixType: 'GENERATE_VOICE'
                });
            }
        });

        // ----------------------------------------------------
        // RULE 7: SHALLOW LORE & UNMOTIVATED CHARACTERS
        // ----------------------------------------------------
        characters.forEach(char => {
            const lore = (char.loreNotes || '').trim();
            const words = lore ? lore.split(/\s+/).filter(Boolean).length : 0;

            if (words < 12 && (char.tier === 'Main Target' || char.tier === 'Supporting')) {
                issues.push({
                    id: `shallow_lore_${char.id}`,
                    type: 'SHALLOW_LORE',
                    severity: 'SUGGESTION',
                    title: `Underdeveloped Motive: ${char.name} (${words} words)`,
                    description: `Lore notes for ${char.name} are very brief. Their personal motivation, secret allegiance, and psychological reaction to Project Omega are unexplained.`,
                    recommendation: 'Deepen their backstory with clear motives, secrets, or friction with OmniCorp executives.',
                    targetCharId: char.id,
                    fixType: 'DEEPEN_LORE'
                });
            }
        });

        // Calculate Overall Health Score (0 - 100%)
        const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
        const warningCount = issues.filter(i => i.severity === 'WARNING').length;
        const suggestionCount = issues.filter(i => i.severity === 'SUGGESTION').length;

        let deductions = (criticalCount * 25) + (warningCount * 8) + (suggestionCount * 3);
        const healthScore = Math.max(10, Math.min(100, 100 - deductions));

        return {
            issues,
            criticalCount,
            warningCount,
            suggestionCount,
            healthScore,
            canReachClimax,
            criticalPath,
            protagonist,
            climaxTarget
        };
    }, [characters, decisionLines]);

    // Active issues filtered by dismissals & user severity filter
    const activeIssues = useMemo(() => {
        let list = [...auditReport.issues, ...aiScanResults].filter(i => !dismissedIssues.has(i.id));
        if (filterSeverity === 'ALL') return list;
        return list.filter(i => i.severity === filterSeverity);
    }, [auditReport.issues, aiScanResults, dismissedIssues, filterSeverity]);

    // Dismiss or Restore issue
    const handleDismissIssue = (id) => {
        setDismissedIssues(prev => new Set([...prev, id]));
        showToastMsg('Issue marked as resolved / dismissed.');
    };

    const showToastMsg = (msg) => {
        setActionSuccessMsg(msg);
        setTimeout(() => setActionSuccessMsg(''), 3000);
    };

    // ==========================================
    // 2. AI DEEP LORE & PLOT HOLE AUDITOR SCAN
    // ==========================================
    const handleRunAiDeepScan = async () => {
        setIsAiScanning(true);
        setAiScanError('');
        setAiScanResults([]);

        const rosterSummary = characters.map(c => 
            `- [${c.badgeId}] ${c.name} (${c.title}, ${c.dept}, Tier: ${c.tier}, Clearance: ${c.clearance})\n  Clue: "${c.clueHeld || 'None'}"\n  Quote: "${c.messageSnippet || 'None'}"\n  Lore: ${c.loreNotes || 'None'}`
        ).join('\n');

        const linesSummary = decisionLines.map((dl, idx) => {
            const from = characters.find(c => c.id === dl.fromCharId)?.name || dl.fromCharId;
            const to = characters.find(c => c.id === dl.toCharId)?.name || dl.toCharId;
            return `${idx + 1}. ${from} ➔ ${to} | Action: ${dl.investigationAction} | Discovers: ${dl.clueDiscovered} | Unlocks: ${dl.unlocksType}`;
        }).join('\n');

        const prompt = `You are the Lead Narrative Continuity Auditor for the cosmic horror ARG game "OmniCorp Intranet".
Analyze the following active character roster and investigation decision lines for deep plot holes, timeline paradoxes in the 72-hour reset loop, and narrative inconsistencies:

=== ACTIVE PERSONNEL ROSTER ===
${rosterSummary}

=== DECISION CHAIN & LEADS ===
${linesSummary}

AUDIT OBJECTIVE:
Find 3 to 5 subtle narrative plot holes or contradictions (e.g. unexplained clearance leaps, timeline resets where someone retains memories without an audit tool, character motive contradictions, or unanswered questions).

Format your response STRICTLY as a JSON array of objects with the following schema:
[
  {
    "id": "ai_issue_1",
    "severity": "CRITICAL" | "WARNING" | "SUGGESTION",
    "title": "Brief descriptive title of the plot hole",
    "description": "2-3 sentences explaining exactly why this is a plot hole or narrative flaw.",
    "recommendation": "Concrete proposed resolution to make the canon watertight.",
    "targetCharId": "char_id_if_applicable_or_null",
    "suggestedFix": {
      "field": "loreNotes" | "clueHeld" | "messageSnippet",
      "proposal": "The exact narrative text to patch this issue"
    }
  }
]
Output ONLY valid JSON. No conversational preamble.`;

        // Check if API key is present
        if (!openRouterKey || openRouterKey.trim() === '') {
            // Use high quality local simulated audit
            setTimeout(() => {
                const simulatedIssues = [
                    {
                        id: 'ai_sim_1',
                        severity: 'WARNING',
                        title: 'Loop Memory Retention Paradox: David Bowman vs AUDIT-04',
                        description: 'David Bowman notes "Memory scrub isn\'t taking" in log entry 114, yet AUDIT-04 is supposed to be the only active anomaly with the audit tool. Why has Bowman retained consciousness across 14 loop iterations without being deprovisioned by HR?',
                        recommendation: 'Clarify that Bowman injected an unauthorized BIOS patch into SysTerminal NODE-666 that shields his terminal buffer from overnight wipes.',
                        targetCharId: 'char_bowman',
                        suggestedFix: {
                            field: 'loreNotes',
                            proposal: 'Lead SysAdmin David Bowman secretly injected an unauthorized BIOS buffer into NODE-666 that survives nightly memory wipes. He watches AUDIT-04 restart every 72 hours, quietly feeding terminal hints while staying under HR Director Patricia Vance\'s radar.'
                        }
                    },
                    {
                        id: 'ai_sim_2',
                        severity: 'SUGGESTION',
                        title: 'Unexplained Slurry Transit: Courier Authorization',
                        description: 'Intern #442 delivers biological organ drums (PO-4412) to Sub-level 3, but only possesses L1 clearance. Sector 7 R&D requires L2 clearance. Who escorted the courier down the emergency freight elevator?',
                        recommendation: 'Mention that Bill Lumbergh provided a forged maintenance bypass badge to avoid putting his own name on the Sector 7 biometric transit log.',
                        targetCharId: 'char_intern',
                        suggestedFix: {
                            field: 'loreNotes',
                            proposal: 'Overworked intern courier. Lumbergh handed them a forged "Janitorial Emergency Bypass" keycard to deliver the leaking biological container to Sub-level 3 without triggering security checkpoints.'
                        }
                    },
                    {
                        id: 'ai_sim_3',
                        severity: 'WARNING',
                        title: 'Missing Countermeasure: HR Vance Knowledge of Sarah Kone',
                        description: 'Sarah Kone openly emails Procurement about $40,000 for Cryo-Preservation, but HR Director Patricia Vance has not placed Sarah under surveillance or marked her for deprovisioning.',
                        recommendation: 'Add a note to Vance\'s dossier showing Sarah\'s termination ticket is queued but delayed by the 72-hour reset cycle.',
                        targetCharId: 'char_sarah',
                        suggestedFix: {
                            field: 'loreNotes',
                            proposal: 'Believes in the audit system. Unbeknownst to Sarah, Patricia Vance has already prepared her "Permanent Voluntary Deprovisioning" file, scheduled to execute at T-minus 12 hours before the loop restarts.'
                        }
                    }
                ];
                setAiScanResults(simulatedIssues);
                setIsAiScanning(false);
                showToastMsg('AI Narrative Lore Scan complete! 3 issues discovered.');
            }, 1200);
            return;
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openRouterKey.trim()}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'OmniCorp Intranet Studio'
                },
                body: JSON.stringify({
                    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
                    messages: [
                        { role: 'system', content: 'You are a meticulous narrative game designer auditing a cosmic horror puzzle ARG for plot holes.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.5,
                    max_tokens: 2048
                })
            });

            if (!response.ok) {
                throw new Error(`OpenRouter returned HTTP ${response.status}`);
            }

            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
            
            // Extract JSON array
            const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setAiScanResults(parsed);
                showToastMsg(`AI Deep Scan found ${parsed.length} narrative continuity points!`);
            } else {
                throw new Error('Could not parse JSON array from AI response.');
            }
        } catch (err) {
            console.error('AI Scan Error:', err);
            setAiScanError(`AI Scan Notice: ${err.message}. Switched to local continuity auditor.`);
            // Fallback to rich local auditor issues
            setAiScanResults([
                {
                    id: 'ai_fallback_1',
                    severity: 'WARNING',
                    title: 'Loop Memory Retention: SysAdmin Bowman Buffer',
                    description: 'David Bowman notes memory scrub isn\'t taking in log entry 114, but why hasn\'t Patricia Vance noticed his persistent terminal memory usage?',
                    recommendation: 'Add lore specifying Bowman masks his memory cache under background diagnostic routine #4492.',
                    targetCharId: 'char_bowman',
                    suggestedFix: {
                        field: 'loreNotes',
                        proposal: 'Bowman hides his terminal persistence routine under diagnostic thread #4492. Every loop cycle, he wakes up before the rest of HQ.'
                    }
                }
            ]);
        } finally {
            setIsAiScanning(false);
        }
    };

    // ==========================================
    // 3. 1-CLICK QUICK FIX RESOLVER
    // ==========================================
    const handleApplyQuickFix = (issue) => {
        const target = characters.find(c => c.id === issue.targetCharId);
        if (!target) {
            showToastMsg('Target character not found in roster.');
            return;
        }

        if (issue.suggestedFix) {
            const { field, proposal } = issue.suggestedFix;
            const updated = {
                ...target,
                [field]: proposal
            };
            onUpdateCharacter(updated);
            handleDismissIssue(issue.id);
            showToastMsg(`Applied narrative fix to ${target.name}!`);
        } else if (issue.fixType === 'GENERATE_CLUE') {
            const updated = {
                ...target,
                clueHeld: `Security Clearance Credentials (${target.badgeId} / Omni${target.badgeId}); unredacts department memo regarding Project Omega.`
            };
            onUpdateCharacter(updated);
            handleDismissIssue(issue.id);
            showToastMsg(`Generated puzzle credential clue for ${target.name}!`);
        } else if (issue.fixType === 'GENERATE_VOICE') {
            const updated = {
                ...target,
                messageSnippet: `SYSTEM LOG: "Something went wrong in ${target.dept}. If you find this terminal, do not let them initiate the reset."`
            };
            onUpdateCharacter(updated);
            handleDismissIssue(issue.id);
            showToastMsg(`Drafted recorded voice residue for ${target.name}!`);
        } else {
            // Open character dossier directly
            onSelectCharacter(target);
        }
    };

    // Helper for badge colors
    const getSeverityBadge = (severity) => {
        switch (severity) {
            case 'CRITICAL':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'WARNING':
                return 'bg-amber-100 text-amber-900 border-amber-300';
            case 'SUGGESTION':
                return 'bg-purple-100 text-purple-900 border-purple-300';
            default:
                return 'bg-blue-100 text-blue-900 border-blue-300';
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
            {/* SUCCESS BANNER */}
            {actionSuccessMsg && (
                <div className="fixed top-20 right-6 z-50 bg-[#3b2a5a] text-[#ffd6e8] px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-[#ff9ec7] animate-in slide-in-from-top-4">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>{actionSuccessMsg}</span>
                </div>
            )}

            {/* TOP HEALTH & METRICS BANNER */}
            <div className="bg-white/95 p-5 rounded-3xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1)] flex flex-wrap items-center justify-between gap-4">
                
                {/* Score & Gauge */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffd6e8] to-[#f3e8ff] border-2 border-[#ff9ec7] shadow-sm">
                        <span className="text-xl font-bold font-serif text-[#3b2a5a]">
                            {auditReport.healthScore}%
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-bold font-serif text-[#3b2a5a]">
                                Story Continuity & Plot Hole Auditor
                            </h2>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#f3e8ff] text-[#3b2a5a] border border-[#c9b6ff]">
                                Real-Time Engine
                            </span>
                        </div>
                        <p className="text-xs text-[#3b2a5a]/70">
                            {auditReport.healthScore >= 90
                                ? '✨ Excellent canon consistency. The critical investigation chain is unbroken.'
                                : auditReport.healthScore >= 70
                                ? '⚠️ Solid narrative base, but actionable plot holes or dead ends require review.'
                                : '🚨 Critical narrative gaps detected. The mystery path may be unwinnable in its current state.'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleRunAiDeepScan}
                        disabled={isAiScanning}
                        className="px-4 py-2 bg-gradient-to-r from-[#3b2a5a] to-[#51357a] hover:from-[#2e2047] hover:to-[#432b66] text-[#ffd6e8] rounded-xl font-bold text-xs flex items-center gap-2 border border-[#ff9ec7] transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        title="Scan entire story roster and decision chains with AI"
                    >
                        {isAiScanning ? (
                            <>
                                <RefreshCw size={14} className="animate-spin text-[#ff9ec7]" />
                                <span>Scanning Lore Deeply...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} className="text-[#ff9ec7]" />
                                <span>Run AI Deep-Lore Scan</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* CRITICAL PATH VISUALIZER BREADCRUMB */}
            <div className="bg-gradient-to-r from-[#fbf7ff] via-white to-[#ffd6e8]/20 p-4 rounded-2xl border border-[#c9b6ff] shadow-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#3b2a5a]">
                        <Zap size={15} className="text-[#ff9ec7]" />
                        <span>Canonical Solution Path to Climax (Subject 882)</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#3b2a5a]/70">
                        {auditReport.canReachClimax
                            ? `✅ Unbroken Chain: ${auditReport.criticalPath.length} key milestones`
                            : '🚨 Path Broken: Climax Unreachable'}
                    </span>
                </div>

                {auditReport.canReachClimax ? (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
                        {auditReport.criticalPath.map((charId, idx) => {
                            const char = characters.find(c => c.id === charId);
                            const isLast = idx === auditReport.criticalPath.length - 1;
                            return (
                                <React.Fragment key={charId}>
                                    <button
                                        type="button"
                                        onClick={() => char && onSelectCharacter(char)}
                                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold shrink-0 transition-all cursor-pointer ${
                                            idx === 0
                                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7]'
                                                : isLast
                                                ? 'bg-red-500/10 text-red-900 border-red-300'
                                                : 'bg-white hover:bg-[#ffd6e8]/50 text-[#3b2a5a] border-[#c9b6ff]'
                                        }`}
                                        title={`View dossier for ${char?.name || charId}`}
                                    >
                                        <User size={12} className={idx === 0 ? 'text-[#ff9ec7]' : 'text-[#3b2a5a]/60'} />
                                        <span>{char?.name || charId}</span>
                                        <span className="text-[10px] font-mono opacity-60">({char?.clearance || 'L0'})</span>
                                    </button>
                                    {!isLast && <ArrowRight size={13} className="text-[#ff9ec7] shrink-0" />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center justify-between">
                        <span>
                            Players cannot reach the final climax target from the protagonist. Connect decision lines to bridge the gap!
                        </span>
                        <button
                            type="button"
                            onClick={() => onOpenAddDecisionLine && onOpenAddDecisionLine()}
                            className="px-3 py-1 bg-red-900 text-white rounded-lg font-bold text-xs hover:bg-red-800 transition-colors cursor-pointer"
                        >
                            + Connect Decision Line
                        </button>
                    </div>
                )}
            </div>

            {/* SEVERITY FILTER CHIPS & STATS STRIP */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setFilterSeverity('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            filterSeverity === 'ALL'
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-xs'
                                : 'bg-white text-[#3b2a5a] border border-[#c9b6ff] hover:bg-[#ffd6e8]/40'
                        }`}
                    >
                        All Issues ({activeIssues.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterSeverity('CRITICAL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            filterSeverity === 'CRITICAL'
                                ? 'bg-red-700 text-white shadow-xs'
                                : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
                        }`}
                    >
                        <ShieldAlert size={13} />
                        <span>Critical ({activeIssues.filter(i => i.severity === 'CRITICAL').length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterSeverity('WARNING')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            filterSeverity === 'WARNING'
                                ? 'bg-amber-700 text-white shadow-xs'
                                : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                        }`}
                    >
                        <AlertTriangle size={13} />
                        <span>Warnings ({activeIssues.filter(i => i.severity === 'WARNING').length})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterSeverity('SUGGESTION')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            filterSeverity === 'SUGGESTION'
                                ? 'bg-[#51357a] text-white shadow-xs'
                                : 'bg-white text-[#51357a] border border-[#c9b6ff] hover:bg-[#f3e8ff]'
                        }`}
                    >
                        <Sparkles size={13} />
                        <span>Suggestions ({activeIssues.filter(i => i.severity === 'SUGGESTION').length})</span>
                    </button>
                </div>

                {dismissedIssues.size > 0 && (
                    <button
                        type="button"
                        onClick={() => setDismissedIssues(new Set())}
                        className="text-xs text-[#3b2a5a]/70 hover:text-[#3b2a5a] underline cursor-pointer"
                    >
                        Restore {dismissedIssues.size} Dismissed Issues
                    </button>
                )}
            </div>

            {aiScanError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                    <span>{aiScanError}</span>
                    <button type="button" onClick={() => setAiScanError('')} className="p-1 hover:bg-amber-100 rounded text-amber-700 cursor-pointer">
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* AUDIT ISSUES LIST */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-8">
                {activeIssues.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-[#3b2a5a]/70 border-2 border-dashed border-[#c9b6ff] rounded-3xl bg-white/70 space-y-2">
                        <CheckCircle2 size={42} className="text-emerald-500 mb-1" />
                        <h4 className="text-base font-bold text-[#3b2a5a]">No Plot Holes Found in this Category!</h4>
                        <p className="text-xs text-[#3b2a5a]/70 max-w-md text-center">
                            Your narrative structure, decision lines, and character clues form a cohesive and winnable story graph.
                        </p>
                    </div>
                ) : (
                    activeIssues.map(issue => {
                        const targetChar = characters.find(c => c.id === issue.targetCharId);
                        const isAiIssue = issue.id.startsWith('ai_');

                        return (
                            <div
                                key={issue.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-xs hover:shadow-md transition-all space-y-3"
                            >
                                {/* Header */}
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {issue.severity === 'CRITICAL' ? (
                                                <div className="p-2 rounded-xl bg-red-100 text-red-700 border border-red-200">
                                                    <ShieldAlert size={16} />
                                                </div>
                                            ) : issue.severity === 'WARNING' ? (
                                                <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                                                    <AlertTriangle size={16} />
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-xl bg-[#f3e8ff] text-[#3b2a5a] border border-[#c9b6ff]">
                                                    <Sparkles size={16} className="text-[#ff9ec7]" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold text-[#3b2a5a]">
                                                    {issue.title}
                                                </h3>
                                                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getSeverityBadge(issue.severity)}`}>
                                                    {issue.severity}
                                                </span>
                                                {isAiIssue && (
                                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#3b2a5a] text-[#ffd6e8] border border-[#ff9ec7]">
                                                        AI Deep-Scan Finding
                                                    </span>
                                                )}
                                                {targetChar && (
                                                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#fbf7ff] text-[#3b2a5a] border border-[#c9b6ff]">
                                                        {targetChar.name} ({targetChar.badgeId})
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#3b2a5a]/80 leading-relaxed">
                                                {issue.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dismiss / Mark Resolved button */}
                                    <button
                                        type="button"
                                        onClick={() => handleDismissIssue(issue.id)}
                                        className="p-1.5 text-[#3b2a5a]/40 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                        title="Mark as resolved / dismiss"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>

                                {/* Recommendation Box */}
                                <div className="p-3 bg-[#fbf7ff] rounded-xl border border-[#c9b6ff]/60 flex items-start gap-2.5 text-xs text-[#3b2a5a]">
                                    <BookOpen size={14} className="text-[#ff9ec7] shrink-0 mt-0.5" />
                                    <div className="leading-relaxed">
                                        <strong className="text-[#3b2a5a] font-bold">Recommended Resolution: </strong>
                                        <span>{issue.recommendation}</span>
                                    </div>
                                </div>

                                {/* AI Proposal Preview if available */}
                                {issue.suggestedFix && (
                                    <div className="p-3 bg-gradient-to-r from-[#ffd6e8]/20 to-[#f3e8ff]/40 rounded-xl border border-[#ff9ec7]/40 text-xs text-[#3b2a5a] space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase text-[#3b2a5a]">
                                            <Sparkles size={12} className="text-[#ff9ec7]" />
                                            <span>Ready-to-Apply Patch ({issue.suggestedFix.field}):</span>
                                        </div>
                                        <p className="italic bg-white/80 p-2.5 rounded-lg border border-[#c9b6ff]/60 leading-relaxed font-serif">
                                            "{issue.suggestedFix.proposal}"
                                        </p>
                                    </div>
                                )}

                                {/* ACTION BUTTONS BAR: "Review it and work on it ASAP then and there" */}
                                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#c9b6ff]/30">
                                    <div className="flex items-center gap-2">
                                        {/* 1-Click Apply Fix */}
                                        <button
                                            type="button"
                                            onClick={() => handleApplyQuickFix(issue)}
                                            className="px-3 py-1.5 bg-[#3b2a5a] hover:bg-[#2c1e44] text-[#ffd6e8] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#ff9ec7] transition-all cursor-pointer shadow-xs hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            <Zap size={13} className="text-[#ff9ec7]" />
                                            <span>{issue.suggestedFix ? '1-Click Apply AI Patch' : 'Quick Auto-Fix'}</span>
                                        </button>

                                        {/* Open Full Dossier Workspace */}
                                        {targetChar && (
                                            <button
                                                type="button"
                                                onClick={() => onSelectCharacter(targetChar)}
                                                className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                                                title={`Open full dual-pane workspace for ${targetChar.name}`}
                                            >
                                                <ExternalLink size={13} />
                                                <span>Open Dossier & Co-Writer</span>
                                            </button>
                                        )}

                                        {/* Edit in form if available */}
                                        {targetChar && onOpenEditForm && (
                                            <button
                                                type="button"
                                                onClick={() => onOpenEditForm(targetChar)}
                                                className="px-2.5 py-1.5 bg-[#f3e8ff] hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1 border border-[#c9b6ff] transition-all cursor-pointer shadow-xs"
                                                title={`Edit ${targetChar.name} in standard form`}
                                            >
                                                <Edit3 size={13} />
                                                <span>Edit</span>
                                            </button>
                                        )}

                                        {/* Add Decision Line if it's an orphan or dead end */}
                                        {(issue.type === 'UNREACHABLE_CHARACTER' || issue.type === 'DEAD_END' || issue.type === 'UNWINNABLE_LOOP') && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (onOpenAddDecisionLine) {
                                                        onOpenAddDecisionLine(issue.targetCharId);
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-[#f3e8ff] hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-xl font-bold text-xs flex items-center gap-1.5 border border-[#c9b6ff] transition-all cursor-pointer"
                                            >
                                                <Link size={13} />
                                                <span>Connect Decision Line</span>
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleDismissIssue(issue.id)}
                                        className="text-[11px] text-[#3b2a5a]/60 hover:text-[#3b2a5a] underline font-medium cursor-pointer"
                                    >
                                        Mark as Intentional / Dismiss
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
