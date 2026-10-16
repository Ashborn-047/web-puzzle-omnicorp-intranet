import React from 'react';
import { Upload, Download, FileText, Copy } from 'lucide-react';

export default function ExportTab({
    characters = [],
    decisionLines = [],
    onUploadJSON,
    onDownloadJSON,
    onCopyDirectoryJs,
    onCopyAllJson
}) {
    return (
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
                <div>
                    <h3 className="text-sm font-bold text-[#3b2a5a]">Export & Sync Narrative Architecture</h3>
                    <p className="text-xs text-[#3b2a5a]/70">
                        Download, upload, or copy your character roster and decision lines to sync directly with project code.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <label className="bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)] transition-all">
                        <Upload size={14} /> Import JSON
                        <input type="file" accept=".json" onChange={onUploadJSON} className="hidden" />
                    </label>
                    <button
                        type="button"
                        onClick={onDownloadJSON}
                        className="bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)] transition-all cursor-pointer"
                    >
                        <Download size={14} /> Download JSON
                    </button>
                    <button
                        type="button"
                        onClick={onCopyDirectoryJs}
                        className="bg-[#ffd6e8] hover:bg-[#ff9ec7]/40 text-[#3b2a5a] border border-[#ff9ec7] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(255,158,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all cursor-pointer"
                    >
                        <FileText size={14} /> Copy as directory.js Code
                    </button>
                    <button
                        type="button"
                        onClick={onCopyAllJson}
                        className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all cursor-pointer"
                    >
                        <Copy size={14} /> Copy All JSON
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white border border-[#c9b6ff] rounded-2xl p-4 overflow-hidden flex flex-col font-mono text-xs text-[#3b2a5a] shadow-[inset_0_2px_4px_rgba(59,42,90,0.03)]">
                <pre className="flex-1 overflow-auto no-scrollbar">
                    {JSON.stringify({ characters, decisionLines }, null, 2)}
                </pre>
            </div>
        </div>
    );
}
