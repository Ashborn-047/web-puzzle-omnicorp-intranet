import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, Download, Upload, CheckCircle2, AlertCircle, X, RefreshCw, ExternalLink, HardDrive } from 'lucide-react';

function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
}

export default function StudioSyncModal({
    isOpen,
    onClose,
    characters,
    decisionLines,
    onImportData,
    onNotify
}) {
    const [pat, setPat] = useState('');
    const [ownerRepo, setOwnerRepo] = useState('Ashborn-047/web-puzzle-omnicorp-intranet');
    const filePath = 'src/data/narrative_studio_save.json';
    const [branch, setBranch] = useState('main');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'error', message: string, commitUrl?: string }

    useEffect(() => {
        const savedPat = localStorage.getItem('omnicorp_github_pat') || '';
        const savedRepo = localStorage.getItem('omnicorp_github_repo') || 'Ashborn-047/web-puzzle-omnicorp-intranet';
        setPat(savedPat);
        setOwnerRepo(savedRepo);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSaveSettings = () => {
        localStorage.setItem('omnicorp_github_pat', pat.trim());
        localStorage.setItem('omnicorp_github_repo', ownerRepo.trim());
    };

    const handleSyncToGitHub = async () => {
        const token = pat.trim();
        if (!token) {
            setSyncStatus({
                type: 'error',
                message: 'GitHub Personal Access Token is required to commit to repository.'
            });
            return;
        }

        setIsSyncing(true);
        setSyncStatus(null);
        handleSaveSettings();

        try {
            const repoUrl = `https://api.github.com/repos/${ownerRepo.trim()}/contents/${filePath.trim()}?ref=${branch.trim()}`;
            
            // 1. Fetch current file SHA if exists
            let currentSha = null;
            try {
                const getRes = await fetch(repoUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github+json'
                    }
                });
                if (getRes.ok) {
                    const getData = await getRes.json();
                    currentSha = getData.sha;
                }
            } catch (err) {
                console.warn('File might be new or not found:', err);
            }

            // 2. Prepare payload
            const payload = {
                characters,
                decisionLines,
                lastSynced: new Date().toISOString()
            };
            const jsonString = JSON.stringify(payload, null, 2);
            const contentBase64 = utf8ToBase64(jsonString);

            // 3. PUT commit to GitHub
            const putRes = await fetch(`https://api.github.com/repos/${ownerRepo.trim()}/contents/${filePath.trim()}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `sync(studio): update narrative characters & decision tree [${new Date().toLocaleDateString()}]`,
                    content: contentBase64,
                    branch: branch.trim(),
                    ...(currentSha ? { sha: currentSha } : {})
                })
            });

            const putData = await putRes.json();

            if (!putRes.ok) {
                throw new Error(putData.message || `GitHub API error: ${putRes.status}`);
            }

            const commitUrl = putData.commit?.html_url;
            setSyncStatus({
                type: 'success',
                message: 'Successfully pushed to GitHub! When back on your local PC, run `git pull` to sync.',
                commitUrl
            });
            if (onNotify) onNotify('Cloud sync to GitHub completed!');
        } catch (err) {
            setSyncStatus({
                type: 'error',
                message: `Sync failed: ${err.message}`
            });
        } finally {
            setIsSyncing(false);
        }
    };

    // Export JSON to local file download
    const handleExportJson = () => {
        const payload = {
            characters,
            decisionLines,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omnicorp_narrative_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        if (onNotify) onNotify('Downloaded backup JSON!');
    };

    // Import JSON from file
    const handleFileImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.characters && parsed.decisionLines) {
                    onImportData(parsed.characters, parsed.decisionLines);
                    setSyncStatus({
                        type: 'success',
                        message: `Successfully loaded ${parsed.characters.length} characters & ${parsed.decisionLines.length} decision lines!`
                    });
                    if (onNotify) onNotify('Imported narrative dataset!');
                } else {
                    setSyncStatus({
                        type: 'error',
                        message: 'Invalid file format. Must contain characters and decisionLines.'
                    });
                }
            } catch {
                setSyncStatus({
                    type: 'error',
                    message: 'Failed to parse JSON file.'
                });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <GitBranch size={16} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">Cloud Sync & Local Bridge</h3>
                            <p className="text-xs text-slate-400">Sync work done in office directly into your repository</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 text-xs">
                    {/* Status Alert */}
                    {syncStatus && (
                        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                            syncStatus.type === 'success'
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                : 'bg-red-950/40 border-red-800/60 text-red-300'
                        }`}>
                            {syncStatus.type === 'success' ? (
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1">
                                <p className="font-medium">{syncStatus.message}</p>
                                {syncStatus.commitUrl && (
                                    <a
                                        href={syncStatus.commitUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[11px] underline text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                                    >
                                        View Commit on GitHub <ExternalLink size={10} />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section 1: 1-Click Direct GitHub Commit */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                                <GitCommit size={15} />
                                <span className="uppercase tracking-wider text-[11px]">Direct GitHub Commit (Recommended)</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Pushes directly to repo</span>
                        </div>

                        <p className="text-slate-400 leading-relaxed">
                            Commits your latest characters & decision tree to <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">src/data/narrative_studio_save.json</code> in GitHub.
                            When you sit at your local machine, run <code className="text-emerald-300 font-mono bg-slate-900 px-1.5 py-0.5 rounded">git pull</code> and it is instantly synced!
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    GitHub Personal Access Token (PAT)
                                </label>
                                <input
                                    type="password"
                                    value={pat}
                                    onChange={(e) => setPat(e.target.value)}
                                    placeholder="ghp_xxxx or github_pat_xxxx"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                                    <span>Saved locally in this browser. Never committed or shared.</span>
                                    <a
                                        href="https://github.com/settings/tokens?type=beta"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                                    >
                                        Create Token ↗
                                    </a>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Repository</label>
                                    <input
                                        type="text"
                                        value={ownerRepo}
                                        onChange={(e) => setOwnerRepo(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Branch</label>
                                    <input
                                        type="text"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSyncToGitHub}
                                disabled={isSyncing}
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.99]"
                            >
                                {isSyncing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" /> Committing to GitHub...
                                    </>
                                ) : (
                                    <>
                                        <GitCommit size={14} /> Commit & Push to GitHub Repo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Offline JSON Backup & Restore */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-300 font-semibold">
                                <HardDrive size={15} />
                                <span className="uppercase tracking-wider text-[11px]">Manual Offline Backup (Fail-safe)</span>
                            </div>
                            <span className="text-[10px] text-slate-400">Zero configuration</span>
                        </div>

                        <p className="text-slate-400">
                            Download your entire roster and decision graph as a standalone JSON backup file, or restore one anytime.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <button
                                type="button"
                                onClick={handleExportJson}
                                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Download size={14} /> Download Backup (.json)
                            </button>

                            <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                                <Upload size={14} /> Restore from (.json)
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleFileImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
