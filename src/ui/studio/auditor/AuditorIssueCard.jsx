import React from 'react';
import {
    ShieldAlert, AlertTriangle, Sparkles, Check, BookOpen,
    Zap, ExternalLink, Edit3, Link
} from 'lucide-react';

const getSeverityBadge = (severity) => {
    switch (severity) {
        case 'CRITICAL':
            return 'bg-red-100 text-red-800 border-red-300 font-bold';
        case 'WARNING':
            return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        case 'SUGGESTION':
            return 'bg-[#f3e8ff] text-[#3b2a5a] border-[#c9b6ff]';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

export default function AuditorIssueCard({
    issue,
    characters = [],
    onApplyQuickFix,
    onSelectCharacter,
    onOpenEditForm,
    onOpenAddDecisionLine,
    onDismissIssue
}) {
    const targetChar = characters.find(c => c.id === issue.targetCharId);
    const isAiIssue = issue.id.startsWith('ai_');

    return (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-xs hover:shadow-md transition-all space-y-3">
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
                    onClick={() => onDismissIssue(issue.id)}
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

            {/* Action Buttons Bar */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#c9b6ff]/30">
                <div className="flex items-center gap-2">
                    {/* 1-Click Apply Fix */}
                    <button
                        type="button"
                        onClick={() => onApplyQuickFix(issue)}
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
                    onClick={() => onDismissIssue(issue.id)}
                    className="text-[11px] text-[#3b2a5a]/60 hover:text-[#3b2a5a] underline font-medium cursor-pointer"
                >
                    Mark as Intentional / Dismiss
                </button>
            </div>
        </div>
    );
}
