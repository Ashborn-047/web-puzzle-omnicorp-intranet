import React, { useState, useMemo } from 'react';
import {
    ShieldAlert, AlertTriangle, Sparkles, CheckCircle2,
    X
} from 'lucide-react';
import { computeAuditReport } from './auditor/auditEngine';
import AuditorHealthGauge from './auditor/AuditorHealthGauge';
import AuditorIssueCard from './auditor/AuditorIssueCard';
import { ACTIVE_MODEL } from './assistant/assistantConstants';

export default function PlotHoleAuditor({
    characters = [],
    decisionLines = [],
    onSelectCharacter,
    onOpenEditForm,
    onOpenAddDecisionLine,
    onUpdateCharacter
}) {
    const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'SUGGESTION'
    const [dismissedIssues, setDismissedIssues] = useState(new Set());
    
    // AI Deep Lore Scan State
    const [isAiScanning, setIsAiScanning] = useState(false);
    const [aiScanResults, setAiScanResults] = useState([]);
    const [aiScanError, setAiScanError] = useState('');
    const [actionSuccessMsg, setActionSuccessMsg] = useState('');

    // API Keys setup
    const openRouterKey = localStorage.getItem('omnicorp_openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY || '';
    const nvidiaKey = localStorage.getItem('omnicorp_nvidia_api_key') || import.meta.env.VITE_NVIDIA_API_KEY || import.meta.env.VITE_NVIDIA_API_KEY_ALT || '';

    // Structural rule-based audit engine
    const auditReport = useMemo(() => {
        return computeAuditReport(characters, decisionLines);
    }, [characters, decisionLines]);

    // Active issues filtered by dismissals & user severity filter
    const activeIssues = useMemo(() => {
        let list = [...auditReport.issues, ...aiScanResults].filter(i => !dismissedIssues.has(i.id));
        if (filterSeverity === 'ALL') return list;
        return list.filter(i => i.severity === filterSeverity);
    }, [auditReport.issues, aiScanResults, dismissedIssues, filterSeverity]);

    const showToastMsg = (msg) => {
        setActionSuccessMsg(msg);
        setTimeout(() => setActionSuccessMsg(''), 3000);
    };

    // Dismiss or Restore issue
    const handleDismissIssue = (id) => {
        setDismissedIssues(prev => new Set([...prev, id]));
        showToastMsg('Issue marked as resolved / dismissed.');
    };

    // AI Deep Lore Scan
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

        if (!openRouterKey.trim() && !nvidiaKey.trim()) {
            setAiScanError('API key required to run AI Deep Lore Scan. Please configure your key in the AI Co-Writer settings (⚙️).');
            setIsAiScanning(false);
            return;
        }

        try {
            let response = null;

            if (openRouterKey.trim()) {
                try {
                    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${openRouterKey.trim()}`,
                            'HTTP-Referer': window.location.origin,
                            'X-Title': 'OmniCorp Intranet Studio'
                        },
                        body: JSON.stringify({
                            model: ACTIVE_MODEL.id,
                            messages: [
                                { role: 'system', content: 'You are a meticulous narrative game designer auditing a cosmic horror puzzle ARG for plot holes.' },
                                { role: 'user', content: prompt }
                            ],
                            temperature: 0.5,
                            max_tokens: 2048
                        })
                    });
                    if (res.ok) response = res;
                } catch (e) {
                    console.warn('OpenRouter audit scan failed, attempting fallback...', e);
                }
            }

            if (!response && nvidiaKey.trim()) {
                try {
                    const nimRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${nvidiaKey.trim()}`
                        },
                        body: JSON.stringify({
                            model: 'nvidia/nemotron-4-340b-instruct',
                            messages: [
                                { role: 'system', content: 'You are a meticulous narrative game designer auditing a cosmic horror puzzle ARG for plot holes.' },
                                { role: 'user', content: prompt }
                            ],
                            temperature: 0.5,
                            max_tokens: 2048
                        })
                    });
                    if (nimRes.ok) response = nimRes;
                } catch (e) {}
            }

            if (!response) {
                throw new Error('Could not reach model via OpenRouter or NVIDIA NIM.');
            }

            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || '';
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
            setAiScanError(`AI Scan Error: ${err.message}. Please check your OpenRouter API key.`);
        } finally {
            setIsAiScanning(false);
        }
    };

    // 1-Click Quick Fix
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
            onSelectCharacter(target);
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
            <AuditorHealthGauge
                healthScore={auditReport.healthScore}
                isAiScanning={isAiScanning}
                onRunAiDeepScan={handleRunAiDeepScan}
                canReachClimax={auditReport.canReachClimax}
                criticalPath={auditReport.criticalPath}
                characters={characters}
                onSelectCharacter={onSelectCharacter}
                onOpenAddDecisionLine={onOpenAddDecisionLine}
            />

            {/* SEVERITY FILTER CHIPS */}
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
                    activeIssues.map(issue => (
                        <AuditorIssueCard
                            key={issue.id}
                            issue={issue}
                            characters={characters}
                            onApplyQuickFix={handleApplyQuickFix}
                            onSelectCharacter={onSelectCharacter}
                            onOpenEditForm={onOpenEditForm}
                            onOpenAddDecisionLine={onOpenAddDecisionLine}
                            onDismissIssue={handleDismissIssue}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
