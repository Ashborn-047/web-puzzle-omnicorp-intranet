import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, GitPullRequest, Download, Upload, CheckCircle2, AlertCircle, X, RefreshCw, ExternalLink, HardDrive } from 'lucide-react';

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
    const [syncMode, setSyncMode] = useState('pr'); // 'pr' | 'direct'
    const [branch, setBranch] = useState('main');
    const [customBranch, setCustomBranch] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState(null); // { type: 'success'|'error', message: string, url?: string, branch?: string }

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
                message: 'GitHub Personal Access Token is required.'
            });
            return;
        }

        setIsSyncing(true);
        setSyncStatus(null);
        handleSaveSettings();

        try {
            const cleanRepo = ownerRepo.trim();
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            };

            // Prepare payload
            const payload = {
                characters,
                decisionLines,
                lastSynced: new Date().toISOString()
            };
            const jsonString = JSON.stringify(payload, null, 2);
            const contentBase64 = utf8ToBase64(jsonString);

            let targetBranch = branch.trim();

            // --- MODE 1: CREATE NEW BRANCH & OPEN PULL REQUEST ---
            if (syncMode === 'pr') {
                targetBranch = customBranch.trim() || `feature/narrative-characters-${Date.now().toString().slice(-6)}`;

                // 1. Get base branch commit SHA
                const baseRefRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/ref/heads/main`, { headers });
                if (!baseRefRes.ok) {
                    throw new Error(`Failed to read main branch: HTTP ${baseRefRes.status}`);
                }
                const baseRefData = await baseRefRes.json();
                const baseSha = baseRefData.object.sha;

                // 2. Create the new feature branch
                const createRefRes = await fetch(`https://api.github.com/repos/${cleanRepo}/git/refs`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        ref: `refs/heads/${targetBranch}`,
                        sha: baseSha
                    })
                });

                if (!createRefRes.ok) {
                    const errData = await createRefRes.json().catch(() => ({}));
                    if (!errData.message?.includes('Reference already exists')) {
                        throw new Error(`Failed to create branch: ${errData.message || createRefRes.status}`);
                    }
                }

                // 3. Commit file to new branch
                let currentSha = null;
                try {
                    const fileRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}?ref=${targetBranch}`, { headers });
                    if (fileRes.ok) {
                        const fileData = await fileRes.json();
                        currentSha = fileData.sha;
                    }
                } catch {
                    // File may be new
                }

                const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        message: `feat(studio): add new narrative characters (${characters.length} total)`,
                        content: contentBase64,
                        branch: targetBranch,
                        ...(currentSha ? { sha: currentSha } : {})
                    })
                });

                if (!putRes.ok) {
                    const putErr = await putRes.json().catch(() => ({}));
                    throw new Error(`Commit failed: ${putErr.message || putRes.status}`);
                }

                // 4. Create Pull Request
                const prRes = await fetch(`https://api.github.com/repos/${cleanRepo}/pulls`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        title: `feat(narrative): new studio characters [${characters.length} total]`,
                        head: targetBranch,
                        base: 'main',
                        body: `### 🎭 OmniCorp Narrative Studio Automated PR\n\n- **Total Characters:** ${characters.length}\n- **Decision Lines:** ${decisionLines.length}\n- **Exported from:** GitHub Pages Studio\n\n#### How to test locally:\n\`\`\`bash\ngit fetch origin\ngit checkout ${targetBranch}\n\`\`\``
                    })
                });

                const prData = await prRes.json();
                const prUrl = prData.html_url || `https://github.com/${cleanRepo}/pulls`;

                setSyncStatus({
                    type: 'success',
                    message: `Pull Request created on branch "${targetBranch}"! Check it out locally with: git fetch && git checkout ${targetBranch}`,
                    url: prUrl,
                    branch: targetBranch
                });
                if (onNotify) onNotify(`Created Pull Request on ${targetBranch}!`);
                return;
            }

            // --- MODE 2: DIRECT COMMIT ---
            let currentSha = null;
            try {
                const getRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}?ref=${targetBranch}`, { headers });
                if (getRes.ok) {
                    const getData = await getRes.json();
                    currentSha = getData.sha;
                }
            } catch {
                // file might be new
            }

            const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${filePath}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    message: `sync(studio): update narrative characters [${characters.length} total]`,
                    content: contentBase64,
                    branch: targetBranch,
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
                message: `Successfully pushed to branch "${targetBranch}". On your local PC, run: git checkout ${targetBranch} && git pull`,
                url: commitUrl,
                branch: targetBranch
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
                            <h3 className="font-bold text-sm text-white">GitHub Sync & Pull Request Bridge</h3>
                            <p className="text-xs text-slate-400">Sync work done on office laptop without file downloads</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs">
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
                            <div className="space-y-1.5 flex-1">
                                <p className="font-medium">{syncStatus.message}</p>
                                {syncStatus.url && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <a
                                            href={syncStatus.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5"
                                        >
                                            {syncMode === 'pr' ? 'Open Pull Request on GitHub' : 'View Commit on GitHub'} <ExternalLink size={11} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section 1: GitHub Cloud Sync & PR */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                                <GitPullRequest size={15} />
                                <span className="uppercase tracking-wider text-[11px]">Sync via GitHub Cloud (No File Transfers)</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono font-bold">DLP Safe</span>
                        </div>

                        {/* Mode Toggle: PR vs Direct */}
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setSyncMode('pr')}
                                className={`py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    syncMode === 'pr'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <GitPullRequest size={13} />
                                <span>Create PR & Branch</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setSyncMode('direct')}
                                className={`py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    syncMode === 'direct'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <GitCommit size={13} />
                                <span>Direct Commit</span>
                            </button>
                        </div>

                        <p className="text-slate-400 leading-relaxed text-[11px]">
                            {syncMode === 'pr'
                                ? 'Creates a separate feature branch and opens a Pull Request on GitHub. You can review the changes on GitHub and checkout the branch locally without touching main.'
                                : 'Directly commits to the selected branch. Run git pull on your local machine to sync.'}
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
                                    <span>Saved locally in browser. Zero files downloaded to machine.</span>
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
                                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                        {syncMode === 'pr' ? 'New Branch Name (Optional)' : 'Target Branch'}
                                    </label>
                                    <input
                                        type="text"
                                        value={syncMode === 'pr' ? customBranch : branch}
                                        onChange={(e) => syncMode === 'pr' ? setCustomBranch(e.target.value) : setBranch(e.target.value)}
                                        placeholder={syncMode === 'pr' ? "feature/characters-auto" : "main"}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSyncToGitHub}
                                disabled={isSyncing}
                                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-[0.99]"
                            >
                                {isSyncing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" /> Creating & Syncing...
                                    </>
                                ) : syncMode === 'pr' ? (
                                    <>
                                        <GitPullRequest size={14} /> Create Branch & Open Pull Request
                                    </>
                                ) : (
                                    <>
                                        <GitCommit size={14} /> Commit to Branch
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Zero-Token Web UI instructions */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-[11px]">
                        <span className="text-slate-300 font-bold block">💡 Alternative: Create PR Directly in GitHub Browser (No Token)</span>
                        <p className="text-slate-400 leading-relaxed">
                            If your office blocks tokens, copy the JSON from the <strong>JSON Export</strong> tab, open GitHub in your browser, click the pencil to edit <code className="text-indigo-300">src/data/narrative_studio_save.json</code>, and select <em>"Create a new branch for this commit and start a pull request"</em>.
                        </p>
                    </div>

                    {/* Section 3: Offline Backup */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
                            <div className="flex items-center gap-1.5">
                                <HardDrive size={13} />
                                <span>Manual Offline Backup</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <button
                                type="button"
                                onClick={handleExportJson}
                                className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                            >
                                <Download size={13} /> Download Backup
                            </button>

                            <label className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center text-[11px]">
                                <Upload size={13} /> Restore JSON
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
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer text-xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
