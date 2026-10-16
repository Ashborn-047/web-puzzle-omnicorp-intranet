import React from 'react';
import { RefreshCw, Sparkles, Zap, User, ArrowRight } from 'lucide-react';

export default function AuditorHealthGauge({
    healthScore,
    isAiScanning,
    onRunAiDeepScan,
    canReachClimax,
    criticalPath = [],
    characters = [],
    onSelectCharacter,
    onOpenAddDecisionLine
}) {
    return (
        <div className="space-y-4">
            {/* Top Bar: Health Score, Title & AI Deep-Scan Button */}
            <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)] flex flex-wrap items-center justify-between gap-4">
                {/* Score & Gauge */}
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffd6e8] to-[#f3e8ff] border-2 border-[#ff9ec7] shadow-sm">
                        <span className="text-xl font-bold font-serif text-[#3b2a5a]">
                            {healthScore}%
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
                            {healthScore >= 90
                                ? '✨ Excellent canon consistency. The critical investigation chain is unbroken.'
                                : healthScore >= 70
                                ? '⚠️ Solid narrative base, but actionable plot holes or dead ends require review.'
                                : '🚨 Critical narrative gaps detected. The mystery path may be unwinnable in its current state.'}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={onRunAiDeepScan}
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
                        {canReachClimax
                            ? `✅ Unbroken Chain: ${criticalPath.length} key milestones`
                            : '🚨 Path Broken: Climax Unreachable'}
                    </span>
                </div>

                {canReachClimax ? (
                    <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-xs">
                        {criticalPath.map((charId, idx) => {
                            const char = characters.find(c => c.id === charId);
                            const isLast = idx === criticalPath.length - 1;
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
                            className="px-3 py-1 bg-red-800 text-white rounded-lg font-bold text-xs hover:bg-red-900 cursor-pointer"
                        >
                            Connect Lead
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
