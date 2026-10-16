import React, { useState, useEffect } from 'react';
import initialSavedData from '../../data/narrative_studio_save.json';
import StudioSecurityGate from './StudioSecurityGate.jsx';
import StudioSyncModal from './StudioSyncModal.jsx';
import NemotronAssistant from './NemotronAssistant.jsx';
import CharacterDossierModal from './CharacterDossierModal.jsx';
import PlotHoleAuditor from './PlotHoleAuditor.jsx';
import ObsidianGraphView from './ObsidianGraphView.jsx';
import { generateRandomCharacter } from './omnicorpSimulator.js';

import StudioHeader from './components/StudioHeader.jsx';
import RosterTab from './components/RosterTab.jsx';
import DecisionLinesTab from './components/DecisionLinesTab.jsx';
import ExportTab from './components/ExportTab.jsx';
import CharacterEditModal from './components/CharacterEditModal.jsx';
import DecisionLineModal from './components/DecisionLineModal.jsx';
import {
    DEFAULT_CHARACTERS,
    DEFAULT_DECISION_LINES,
    createUniqueId,
    getExportFilename
} from './constants/narrativeDefaults.js';

export default function NarrativeStudio({ isOpen = true, onClose, isStandalone = false }) {
    // Passcode gate state
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('omnicorp_studio_unlocked') === 'true' ||
               localStorage.getItem('omnicorp_studio_remembered') === 'true';
    });

    // Cloud Sync & AI modal states
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    const [isNemotronOpen, setIsNemotronOpen] = useState(false);

    // Persistent state
    const [characters, setCharacters] = useState(() => {
        const saved = localStorage.getItem('omnicorp_narrative_characters');
        if (saved) {
            try { return JSON.parse(saved); } catch { /* fallback */ }
        }
        return initialSavedData?.characters || DEFAULT_CHARACTERS;
    });

    const [decisionLines, setDecisionLines] = useState(() => {
        const saved = localStorage.getItem('omnicorp_decision_lines');
        if (saved) {
            try { return JSON.parse(saved); } catch { /* fallback */ }
        }
        return initialSavedData?.decisionLines || DEFAULT_DECISION_LINES;
    });

    // View state: 'roster' | 'decision_tree' | 'graph' | 'export' | 'plot_holes'
    const [activeStudioTab, setActiveStudioTab] = useState('roster');

    // Filter and search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

    // Selected / Editing Character
    const [editingChar, setEditingChar] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDossierChar, setSelectedDossierChar] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('dossier') || params.get('char');
        if (!targetId) return null;
        const saved = localStorage.getItem('omnicorp_narrative_characters');
        let list = DEFAULT_CHARACTERS;
        if (saved) {
            try { list = JSON.parse(saved); } catch { /* fallback */ }
        } else if (initialSavedData?.characters) {
            list = initialSavedData.characters;
        }
        return list.find(c => c.id === targetId || c.badgeId === targetId) || null;
    });

    const handleUpdateCharacter = (updatedChar) => {
        setCharacters(prev => prev.map(c => c.id === updatedChar.id ? updatedChar : c));
        setSelectedDossierChar(updatedChar);
        showToast(`Updated dossier for ${updatedChar.name}`);
    };

    // Form inputs
    const [formData, setFormData] = useState({
        name: '',
        badgeId: '',
        dept: 'HQ - FINANCE',
        title: '',
        tier: 'Supporting',
        clearance: 'L1 (INTERNAL)',
        status: 'Active',
        clueHeld: '',
        messageSnippet: '',
        loreNotes: ''
    });

    // Add Decision Line modal state
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({
        fromCharId: '',
        toCharId: '',
        stepName: '',
        investigationAction: '',
        clueDiscovered: '',
        unlocksType: ''
    });

    // Toast message state
    const [toastMessage, setToastMessage] = useState('');

    // Save characters to localStorage on change
    useEffect(() => {
        localStorage.setItem('omnicorp_narrative_characters', JSON.stringify(characters));
    }, [characters]);

    // Save decision lines to localStorage on change
    useEffect(() => {
        localStorage.setItem('omnicorp_decision_lines', JSON.stringify(decisionLines));
    }, [decisionLines]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Lock Studio
    const handleLockStudio = () => {
        sessionStorage.removeItem('omnicorp_studio_unlocked');
        localStorage.removeItem('omnicorp_studio_remembered');
        setIsAuthenticated(false);
        showToast("Studio locked.");
    };

    // Reset to Canon
    const handleResetToCanon = () => {
        if (window.confirm("Reset all characters and decision lines to canon defaults? Custom edits will be replaced.")) {
            setCharacters(DEFAULT_CHARACTERS);
            setDecisionLines(DEFAULT_DECISION_LINES);
            showToast("Reset to Canon Defaults");
        }
    };

    // Open Form for Add
    const handleOpenAddChar = () => {
        setEditingChar(null);
        setFormData({
            name: '',
            badgeId: '',
            dept: 'HQ - FINANCE',
            title: '',
            tier: 'Supporting',
            clearance: 'L1 (INTERNAL)',
            status: 'Active',
            clueHeld: '',
            messageSnippet: '',
            loreNotes: ''
        });
        setIsFormOpen(true);
    };

    const handleOpenAddCharWithData = (data) => {
        setEditingChar(null);
        setFormData({
            name: data.name || '',
            badgeId: data.badgeId || '',
            dept: data.dept || 'HQ - FINANCE',
            title: data.title || '',
            tier: data.tier || 'Supporting',
            clearance: data.clearance || 'L1 (INTERNAL)',
            status: data.status || 'Active',
            clueHeld: data.clueHeld || '',
            messageSnippet: data.messageSnippet || '',
            loreNotes: data.loreNotes || ''
        });
        setIsFormOpen(true);
    };

    const handleAutoFillWithAI = () => {
        const randomChar = generateRandomCharacter();
        setFormData(prev => ({
            ...prev,
            ...randomChar
        }));
        showToast(`Auto-drafted: ${randomChar.name} (${randomChar.title})`);
    };

    // Open Form for Edit
    const handleOpenEditChar = (char) => {
        setEditingChar(char);
        setFormData({
            name: char.name,
            badgeId: char.badgeId,
            dept: char.dept,
            title: char.title,
            tier: char.tier,
            clearance: char.clearance,
            status: char.status || 'Active',
            clueHeld: char.clueHeld || '',
            messageSnippet: char.messageSnippet || '',
            loreNotes: char.loreNotes || ''
        });
        setIsFormOpen(true);
    };

    // Save Character
    const handleSaveChar = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert("Name is required");
            return;
        }

        if (editingChar) {
            setCharacters(prev => prev.map(c => c.id === editingChar.id ? { ...formData, id: c.id } : c));
            showToast(`Updated character: ${formData.name}`);
        } else {
            const newChar = {
                ...formData,
                id: createUniqueId('char')
            };
            setCharacters(prev => [newChar, ...prev]);
            showToast(`Added character: ${formData.name}`);
        }
        setIsFormOpen(false);
    };

    // Delete Character
    const handleDeleteChar = (id, name) => {
        if (window.confirm(`Delete "${name}"? This will also remove any decision lines linked to them.`)) {
            setCharacters(prev => prev.filter(c => c.id !== id));
            setDecisionLines(prev => prev.filter(dl => dl.fromCharId !== id && dl.toCharId !== id));
            showToast(`Deleted ${name}`);
        }
    };

    // Add Decision Line
    const handleSaveDecisionLine = (e) => {
        e.preventDefault();
        if (!linkData.fromCharId || !linkData.toCharId) {
            alert("Please select both source and target characters");
            return;
        }

        const newLink = {
            id: createUniqueId('dl'),
            ...linkData
        };

        setDecisionLines(prev => [...prev, newLink]);
        setIsLinkModalOpen(false);
        setLinkData({
            fromCharId: '',
            toCharId: '',
            stepName: '',
            investigationAction: '',
            clueDiscovered: '',
            unlocksType: ''
        });
        showToast("New Investigation Decision Line added!");
    };

    // Delete Decision Line
    const handleDeleteDecisionLine = (id) => {
        setDecisionLines(prev => prev.filter(dl => dl.id !== id));
        showToast("Decision Line removed");
    };

    // Filtering characters
    const filteredCharacters = characters.filter(char => {
        const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            char.badgeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            char.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            char.clueHeld.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDept = selectedDeptFilter === 'ALL' || char.dept === selectedDeptFilter;
        const matchesRole = selectedRoleFilter === 'ALL' || char.tier === selectedRoleFilter;

        return matchesSearch && matchesDept && matchesRole;
    });

    // Counts
    const counts = {
        total: characters.length,
        protagonist: characters.filter(c => c.tier === 'Protagonist').length,
        main: characters.filter(c => c.tier === 'Main Target').length,
        supporting: characters.filter(c => c.tier === 'Supporting').length,
        background: characters.filter(c => c.tier === 'Background').length,
        deceased: characters.filter(c => c.tier === 'Deceased / MIA').length,
        lines: decisionLines.length
    };

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ characters, decisionLines }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", getExportFilename());
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Downloaded narrative JSON file!");
    };

    const handleUploadJSON = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed.characters && Array.isArray(parsed.characters)) {
                    setCharacters(parsed.characters);
                }
                if (parsed.decisionLines && Array.isArray(parsed.decisionLines)) {
                    setDecisionLines(parsed.decisionLines);
                }
                showToast("Narrative JSON imported successfully!");
            } catch (err) {
                console.error(err);
                alert("Invalid JSON file");
            }
        };
        reader.readAsText(file);
    };

    const generateDirectoryJsCode = () => {
        const staffEntries = characters.map(c => `  {
    name: ${JSON.stringify(c.name)},
    dept: ${JSON.stringify(c.dept)},
    title: ${JSON.stringify(c.title)},
    badgeId: ${JSON.stringify(c.badgeId)},
    tier: ${JSON.stringify(c.tier)},
    clearance: ${JSON.stringify(c.clearance)},
    status: ${JSON.stringify(c.status || 'Active')},
    clueHeld: ${JSON.stringify(c.clueHeld || '')},
    messageSnippet: ${JSON.stringify(c.messageSnippet || '')},
    loreNotes: ${JSON.stringify(c.loreNotes || '')}
  }`).join(',\n');

        return `export const EMPLOYEES = [\n${staffEntries}\n];`;
    };

    if (!isOpen) return null;

    if (!isAuthenticated) {
        return (
            <StudioSecurityGate
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={() => setIsAuthenticated(true)}
                isStandalone={isStandalone}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#fbf7ff] text-[#3b2a5a] flex flex-col font-sans overflow-hidden">
            {/* TOAST ALERT */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] bg-white text-[#3b2a5a] px-4 py-2.5 rounded-2xl shadow-[0_8px_32px_rgba(59,42,90,0.18),0_2px_4px_rgba(255,158,199,0.3)] border border-[#ff9ec7] text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
                    <span className="w-2 h-2 rounded-full bg-[#ff9ec7] animate-pulse" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* HEADER COMPONENT */}
            <StudioHeader
                activeStudioTab={activeStudioTab}
                setActiveStudioTab={setActiveStudioTab}
                counts={counts}
                isSyncModalOpen={isSyncModalOpen}
                setIsSyncModalOpen={setIsSyncModalOpen}
                isNemotronOpen={isNemotronOpen}
                setIsNemotronOpen={setIsNemotronOpen}
                onResetToCanon={handleResetToCanon}
                onLockStudio={handleLockStudio}
                isStandalone={isStandalone}
                onClose={onClose}
            />

            {/* MAIN WORKSPACE */}
            <div className="flex-1 overflow-hidden flex flex-row">
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    {/* TAB: ROSTER */}
                    {activeStudioTab === 'roster' && (
                        <RosterTab
                            characters={characters}
                            filteredCharacters={filteredCharacters}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            selectedDeptFilter={selectedDeptFilter}
                            setSelectedDeptFilter={setSelectedDeptFilter}
                            selectedRoleFilter={selectedRoleFilter}
                            setSelectedRoleFilter={setSelectedRoleFilter}
                            counts={counts}
                            onOpenAddChar={handleOpenAddChar}
                            onOpenEditChar={handleOpenEditChar}
                            onDeleteChar={handleDeleteChar}
                            onSelectDossierChar={setSelectedDossierChar}
                            onOpenNemotron={() => setIsNemotronOpen(true)}
                        />
                    )}

                    {/* TAB: DECISION TREE */}
                    {activeStudioTab === 'decision_tree' && (
                        <DecisionLinesTab
                            characters={characters}
                            decisionLines={decisionLines}
                            onOpenGraphTab={() => setActiveStudioTab('graph')}
                            onOpenAddModal={() => setIsLinkModalOpen(true)}
                            onDeleteLine={handleDeleteDecisionLine}
                        />
                    )}

                    {/* TAB: OBSIDIAN GRAPH VIEW */}
                    {activeStudioTab === 'graph' && (
                        <div className="flex-1 overflow-hidden relative">
                            <ObsidianGraphView
                                characters={characters}
                                decisionLines={decisionLines}
                                onEditCharacter={handleOpenEditChar}
                                onAddDecisionLineFromChar={(charId) => {
                                    setLinkData(prev => ({ ...prev, fromCharId: charId }));
                                    setIsLinkModalOpen(true);
                                }}
                            />
                        </div>
                    )}

                    {/* TAB: EXPORT JSON */}
                    {activeStudioTab === 'export' && (
                        <ExportTab
                            characters={characters}
                            decisionLines={decisionLines}
                            onUploadJSON={handleUploadJSON}
                            onDownloadJSON={handleDownloadJSON}
                            onCopyDirectoryJs={() => {
                                const code = generateDirectoryJsCode();
                                navigator.clipboard.writeText(code);
                                showToast("Copied directory.js code to clipboard!");
                            }}
                            onCopyAllJson={() => {
                                const fullExport = { characters, decisionLines };
                                navigator.clipboard.writeText(JSON.stringify(fullExport, null, 2));
                                showToast("Copied full JSON to clipboard!");
                            }}
                        />
                    )}

                    {/* TAB: PLOT HOLE AUDITOR */}
                    {activeStudioTab === 'plot_holes' && (
                        <PlotHoleAuditor
                            characters={characters}
                            decisionLines={decisionLines}
                            onSelectCharacter={(char) => setSelectedDossierChar(char)}
                            onOpenEditForm={handleOpenEditChar}
                            onOpenAddDecisionLine={(targetCharId) => {
                                if (targetCharId) {
                                    setLinkData(prev => ({ ...prev, fromCharId: targetCharId }));
                                }
                                setIsLinkModalOpen(true);
                            }}
                            onUpdateCharacter={handleUpdateCharacter}
                        />
                    )}
                </div>

                {/* DOCKED ASIDE TAB: AI CO-WRITER */}
                <NemotronAssistant
                    isOpen={isNemotronOpen}
                    onClose={() => setIsNemotronOpen(false)}
                    onAddCharacter={(newChar) => {
                        setCharacters(prev => [newChar, ...prev]);
                        showToast(`Added ${newChar.name} to Roster!`);
                    }}
                    onOpenAddModal={handleOpenAddCharWithData}
                    characters={characters}
                    decisionLines={decisionLines}
                />
            </div>

            {/* MODAL: ADD / EDIT CHARACTER */}
            <CharacterEditModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                editingChar={editingChar}
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveChar}
                onDelete={handleDeleteChar}
                onAutoFillWithAI={handleAutoFillWithAI}
            />

            {/* MODAL: ADD DECISION LINE */}
            <DecisionLineModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                characters={characters}
                linkData={linkData}
                setLinkData={setLinkData}
                onSave={handleSaveDecisionLine}
            />

            {/* MODAL: CLOUD SYNC & GITHUB */}
            <StudioSyncModal
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                characters={characters}
                decisionLines={decisionLines}
                onImportData={(newChars, newLines) => {
                    setCharacters(newChars);
                    setDecisionLines(newLines);
                }}
                onNotify={showToast}
            />

            {/* MODAL: DETAILED CHARACTER DOSSIER & AI STORY CO-WRITER */}
            {selectedDossierChar && (
                <CharacterDossierModal
                    character={selectedDossierChar}
                    onClose={() => setSelectedDossierChar(null)}
                    onUpdateCharacter={handleUpdateCharacter}
                    onOpenEditForm={handleOpenEditChar}
                    onSelectCharacter={(c) => setSelectedDossierChar(c)}
                    decisionLines={decisionLines}
                    characters={characters}
                />
            )}
        </div>
    );
}
