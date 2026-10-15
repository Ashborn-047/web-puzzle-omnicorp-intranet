import React, { useState, useEffect } from 'react';
import {
    Users, Plus, Trash2, Edit3, Link, Check, X, Download, Upload,
    RotateCcw, Shield, Building2, UserCheck, AlertTriangle, Skull,
    HelpCircle, Eye, EyeOff, Sparkles, ChevronRight, ArrowRight,
    Search, Filter, Save, Copy, FileText, CornerDownRight, Activity,
    Network, Lock, GitBranch, Bot
} from 'lucide-react';
import ObsidianGraphView from './ObsidianGraphView.jsx';
import initialSavedData from '../../data/narrative_studio_save.json';
import StudioSecurityGate from './StudioSecurityGate.jsx';
import StudioSyncModal from './StudioSyncModal.jsx';
import NemotronAssistant from './NemotronAssistant.jsx';
import CharacterDossierModal from './CharacterDossierModal.jsx';
import PlotHoleAuditor from './PlotHoleAuditor.jsx';
import { generateRandomCharacter } from './omnicorpSimulator.js';

// Pre-loaded Canon Characters
const DEFAULT_CHARACTERS = [
    {
        id: 'char_audit04',
        name: 'AUDIT-04 (You)',
        badgeId: 'AUDIT-04',
        dept: 'EXTERNAL AUDIT',
        title: 'Contract Auditor',
        tier: 'Protagonist', // 'Protagonist', 'Main Target', 'Supporting', 'Background', 'Deceased / MIA', 'Other'
        clearance: 'L0 (EXTERNAL)',
        status: 'Active (Loop Subject)',
        clueHeld: 'Audit tool; detects Apex Solutions structuring; observes loop timestamp matching past iterations.',
        messageSnippet: 'SYSTEM NOTICE: You have 72 hours to complete the vendor integrity review.',
        loreNotes: 'External contractor hired by OmniCorp. Believes this is her first day, but traces of AUDIT-01 to 03 exist.'
    },
    {
        id: 'char_sarah',
        name: 'Sarah Kone',
        badgeId: '7700',
        dept: 'HQ - FINANCE',
        title: 'Chief Auditor',
        tier: 'Main Target',
        clearance: 'L2 (FINANCE)',
        status: 'Active',
        clueHeld: 'Credentials (7700 / Omni7700); L2 unredacts SysAdmin ID 9000; email arguments over PO-4412 bio-supplies.',
        messageSnippet: 'To: Bill Lumbergh - Why is Finance footing a $40,000 bill for "Cryo-Organic Preservation" under janitorial supplies?',
        loreNotes: 'Believes in the audit system and accountability. Thinks escalating to HR will fix things. She is wrong.'
    },
    {
        id: 'char_lumbergh',
        name: 'Bill Lumbergh',
        badgeId: '0451',
        dept: 'SALES & PROCUREMENT',
        title: 'Procurement Director',
        tier: 'Supporting',
        clearance: 'L2 (PROCUREMENT)',
        status: 'Active',
        clueHeld: 'PO-4412 packing slip; routed special crates to Sector 7 via Intern courier.',
        messageSnippet: 'Yeah, if you could just approve that expedited dry-ice container without asking 50 questions, that would be great.',
        loreNotes: 'Smug bureaucrat who handles supply logistics for the ritual lab while pretending it is mundane hardware.'
    },
    {
        id: 'char_halpert',
        name: 'Jim Halpert',
        badgeId: '7331',
        dept: 'SALES & PROCUREMENT',
        title: 'Sales Lead',
        tier: 'Background',
        clearance: 'L1 (INTERNAL)',
        status: 'Active',
        clueHeld: 'Harmless office banter; mentions Lumbergh leaving weird sealed packages in the copy room.',
        messageSnippet: 'Hey, did someone leave five hundred pounds of rock salt in conference room B, or is that our new team-building exercise?',
        loreNotes: 'Typical corporate background worker. Completely oblivious to what is happening beneath the building.'
    },
    {
        id: 'char_intern',
        name: 'Intern #442',
        badgeId: '0000',
        dept: 'HQ - GENERAL / COURIER',
        title: 'Logistics Courier',
        tier: 'Supporting',
        clearance: 'L1 (INTERNAL)',
        status: 'Active',
        clueHeld: 'Un-shredded paper slips; complaint chat with Isaac Clarke about leaking cold containers delivered to Sub-level 3.',
        messageSnippet: 'Dude, I took that crate down to Sector 7 and it was literally vibrating. Isaac told me to run and wash my gloves.',
        loreNotes: 'Overworked intern who delivers physical physical manifests when the intranet locks them out.'
    },
    {
        id: 'char_clarke',
        name: 'Isaac Clarke',
        badgeId: '1001',
        dept: 'SECTOR 7 - MAINTENANCE',
        title: 'Field Systems Engineer',
        tier: 'Main Target',
        clearance: 'L1 (SECTOR 7)',
        status: 'Active',
        clueHeld: 'Credentials (1001 / Omni1001); filed critical tickets for NODE-666; caught Bowman remoting into HR terminal.',
        messageSnippet: 'Whatever is inside NODE-666 is NOT coolant fluid. The filters are clogged with organic sediment. Shut it down now.',
        loreNotes: 'Pragmatic engineer trying to keep the station alive. Sees the physical bio-horror leaking through the vents.'
    },
    {
        id: 'char_freeman',
        name: 'Gordon Freeman',
        badgeId: '1998',
        dept: 'SECTOR 7 - R&D',
        title: 'Hazmat Researcher',
        tier: 'Supporting',
        clearance: 'L2 (RESEARCH)',
        status: 'Active',
        clueHeld: 'Delta Seal frequency: 1420.4 MHz; EEG wave telemetry showing human subjects syncing with synthetic substrate.',
        messageSnippet: 'The carrier resonance at 1420.4 MHz is stabilizing. The test subjects are no longer rejecting the neural bridge.',
        loreNotes: 'Brilliant researcher who crossed ethical lines long ago. Communicates primarily through technical data logs.'
    },
    {
        id: 'char_bowman',
        name: 'David Bowman',
        badgeId: '9000',
        dept: 'HQ - IT',
        title: 'Lead SysAdmin',
        tier: 'Main Target',
        clearance: 'L2 (SYSADMIN)',
        status: 'Active',
        clueHeld: 'Credentials (9000 / Omni9000); SysTerminal access; ssh 4492 hijack; forensic scratchpad documenting 72h loop deja vu.',
        messageSnippet: 'Log entry 114: The temp audit profile keeps reappearing with identical key strokes. Memory scrub isn\'t taking.',
        loreNotes: 'Treats systemic anomalies as routine software glitches. Knows about the loop from terminal memory leaks.'
    },
    {
        id: 'char_vance',
        name: 'Patricia Vance',
        badgeId: '4492',
        dept: 'HQ - HR',
        title: 'HR Director',
        tier: 'Main Target',
        clearance: 'L3 (EXECUTIVE)',
        status: 'Active',
        clueHeld: 'Credentials (4492 via SSH); Attrition dossiers; Black Vault entrance; Ellen Ripley MIA file and badge ID hint (1979).',
        messageSnippet: 'CONFIDENTIAL: Reassignments to Project Omega are permanent. Ensure family non-disclosure covenants are executed.',
        loreNotes: 'Sanitizes human harvesting into polite corporate HR memos ("Resource Deprovisioning").'
    },
    {
        id: 'char_ripley',
        name: 'Ellen Ripley',
        badgeId: '1979',
        dept: 'SECTOR 7 - LEAD',
        title: 'Chief Scientist',
        tier: 'Deceased / MIA',
        clearance: 'L3 (RESEARCH)',
        status: 'MIA (Loop Predecessor)',
        clueHeld: 'Vault PIN 1979; unscrubbed hidden audio file in Vault; explains the loop and that the auditor is an algorithmic probe.',
        messageSnippet: '[AUDIO TRANSCRIPT]: If you found this, you\'re on iteration 14 or higher. The exit isn\'t real. Force the purge reboot.',
        loreNotes: 'The previous scientist who understood the full occult loop and left the breadcrumb trail behind.'
    },
    {
        id: 'char_subject882',
        name: 'Subject 882 (Former Staff)',
        badgeId: '882',
        dept: 'UNKNOWN / CLASSIFIED',
        title: 'Founding Neural Vessel',
        tier: 'Deceased / MIA',
        clearance: 'L0 (STRIPPED)',
        status: 'Deceased / Substrate',
        clueHeld: 'Key BETA (882) for Project Omega; the first employee successfully harvested into the bio-core.',
        messageSnippet: 'RECORD SEALED: Subject 882 biological continuity achieved. Core synchronization: 99.4%.',
        loreNotes: 'The sacrificial human origin of the Omega bio-network.'
    }
];

// Pre-loaded Decision Lines
const DEFAULT_DECISION_LINES = [
    {
        id: 'dl_1',
        fromCharId: 'char_audit04',
        toCharId: 'char_sarah',
        stepName: 'The Financial Anomaly',
        investigationAction: 'Auditor runs Finance tool, flags Apex Solutions structured payments under $5,000.',
        clueDiscovered: 'Report says authorized by [REDACTED - L2 REQUIRED]. Sarah Kone\'s email signature reveals ID 7700.',
        unlocksType: 'Account Credentials (7700 / Omni7700)'
    },
    {
        id: 'dl_2',
        fromCharId: 'char_sarah',
        toCharId: 'char_bowman',
        stepName: 'The IT Authorization',
        investigationAction: 'Logged in as Sarah (L2), re-runs audit report to reveal authorization identity.',
        clueDiscovered: 'Report unredacts: Authorized by ID 9000 (SysAdmin David Bowman).',
        unlocksType: 'Suspect Identification & Login (9000 / Omni9000)'
    },
    {
        id: 'dl_3',
        fromCharId: 'char_sarah',
        toCharId: 'char_lumbergh',
        stepName: 'The Procurement Lead',
        investigationAction: 'Reads Sarah\'s inbox; finds heated email thread with Procurement over PO-4412.',
        clueDiscovered: 'Bill Lumbergh (0451) approved dry-ice organ containers disguised as janitorial supplies.',
        unlocksType: 'Procurement Trail & Side Lead'
    },
    {
        id: 'dl_4',
        fromCharId: 'char_lumbergh',
        toCharId: 'char_intern',
        stepName: 'The Courier Trail',
        investigationAction: 'Inspects Lumbergh\'s outgoing memos; sees PO-4412 handed to Intern courier for Sector 7.',
        clueDiscovered: 'Intern #442 (0000) logged physical delivery of the leaking container to Sub-level 3.',
        unlocksType: 'Location Intel (Sub-level 3 / Sector 7)'
    },
    {
        id: 'dl_5',
        fromCharId: 'char_intern',
        toCharId: 'char_clarke',
        stepName: 'The Engineering Panic',
        investigationAction: 'Reads Intern #442\'s chat logs; discovers frightened chat with Maintenance Engineer Isaac Clarke.',
        clueDiscovered: 'Isaac Clarke (1001) warns container was leaking biological slurry into NODE-666.',
        unlocksType: 'Maintenance Credentials (1001 / Omni1001)'
    },
    {
        id: 'dl_6',
        fromCharId: 'char_clarke',
        toCharId: 'char_freeman',
        stepName: 'The Resonance Telemetry',
        investigationAction: 'Logs into Isaac Clarke (1001); checks filed maintenance tickets for Sector 7 R&D.',
        clueDiscovered: 'Discovers Gordon Freeman\'s lab pulling 400% voltage at 1420.4 MHz (DELTA Seal).',
        unlocksType: 'Omega Key DELTA (1420.4 MHz)'
    },
    {
        id: 'dl_7',
        fromCharId: 'char_clarke',
        toCharId: 'char_bowman',
        stepName: 'The Surveillance Discovery',
        investigationAction: 'Reads Isaac\'s private chat to Bowman asking why IT is remoting into HR.',
        clueDiscovered: 'Bowman has an active backdoor SSH session into HR Director Patricia Vance.',
        unlocksType: 'Terminal Lateral Movement Lead'
    },
    {
        id: 'dl_8',
        fromCharId: 'char_bowman',
        toCharId: 'char_vance',
        stepName: 'The Terminal Hijack',
        investigationAction: 'Logs into Bowman (9000); accesses SysTerminal; runs "list_users" & "ssh 4492".',
        clueDiscovered: 'Hijacks active session of HR Director Patricia Vance (4492); discovers Bowman\'s loop scratchpad.',
        unlocksType: 'Session Hijack (Patricia Vance L3)'
    },
    {
        id: 'dl_9',
        fromCharId: 'char_vance',
        toCharId: 'char_ripley',
        stepName: 'The Black Vault & The Missing Scientist',
        investigationAction: 'Browses Vance\'s HR archives; finds locked "Black Files" vault requiring a 4-digit PIN.',
        clueDiscovered: 'MIA record for Chief Scientist Ellen Ripley reveals badge ID 1979 is the vault key.',
        unlocksType: 'Vault PIN (1979) & Black Files'
    },
    {
        id: 'dl_10',
        fromCharId: 'char_ripley',
        toCharId: 'char_subject882',
        stepName: 'The Occult Substrate & Loop Revelation',
        investigationAction: 'Unlocks Black Vault with PIN 1979; listens to Ripley\'s unscrubbed tape and reads Subject 882 file.',
        clueDiscovered: 'Key BETA is Subject 882. Ripley reveals the auditor is trapped in iteration 14 of an algorithmic loop.',
        unlocksType: 'Omega Key BETA (882) + Loop Awakening'
    }
];

const ROLES_LIST = [
    'Protagonist',
    'Main Target',
    'Supporting',
    'Background',
    'Deceased / MIA',
    'Other'
];

const DEPARTMENTS_LIST = [
    'EXTERNAL AUDIT',
    'HQ - FINANCE',
    'HQ - IT',
    'HQ - HR',
    'SECTOR 7 - R&D',
    'SECTOR 7 - MAINTENANCE',
    'SALES & PROCUREMENT',
    'HQ - GENERAL / COURIER',
    'EXECUTIVE / OVERSEER',
    'OTHER'
];

const CLEARANCE_LIST = [
    'L0 (EXTERNAL)',
    'L1 (INTERNAL)',
    'L2 (DEPT_SUPERVISOR)',
    'L3 (EXECUTIVE)',
    'L-OMEGA'
];

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

    // View state: 'roster' | 'decision_tree' | 'export'
    const [activeStudioTab, setActiveStudioTab] = useState('roster');

    // Filter and search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');

    // Selected / Editing Character
    const [editingChar, setEditingChar] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedDossierChar, setSelectedDossierChar] = useState(null);

    // Auto-open dossier if URL contains ?dossier=... or ?char=...
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('dossier') || params.get('char');
        if (targetId && characters.length > 0) {
            const found = characters.find(c => c.id === targetId || c.badgeId === targetId);
            if (found) {
                setSelectedDossierChar(found);
            }
        }
    }, [characters]);

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

    // New Decision Line Form
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkData, setLinkData] = useState({
        fromCharId: '',
        toCharId: '',
        stepName: '',
        investigationAction: '',
        clueDiscovered: '',
        unlocksType: ''
    });

    // Notification toast
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        localStorage.setItem('omnicorp_narrative_characters', JSON.stringify(characters));
    }, [characters]);

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

    // Open Form for Add pre-filled with data (e.g. from AI Co-Writer)
    const handleOpenAddCharWithData = (initialData = {}) => {
        setEditingChar(null);
        setFormData({
            name: initialData.name || '',
            badgeId: initialData.badgeId || '',
            dept: initialData.dept || 'HQ - FINANCE',
            title: initialData.title || '',
            tier: initialData.tier || 'Supporting',
            clearance: initialData.clearance || 'L1 (INTERNAL)',
            status: initialData.status || 'Active',
            clueHeld: initialData.clueHeld || '',
            messageSnippet: initialData.messageSnippet || '',
            loreNotes: initialData.loreNotes || ''
        });
        setIsFormOpen(true);
    };

    // Auto-fill form with AI-generated character
    const handleAutoFillWithAI = () => {
        const generated = generateRandomCharacter();
        setFormData({
            name: generated.name,
            badgeId: generated.badgeId,
            dept: generated.dept,
            title: generated.title,
            tier: generated.tier,
            clearance: generated.clearance,
            status: generated.status,
            clueHeld: generated.clueHeld,
            messageSnippet: generated.messageSnippet,
            loreNotes: generated.loreNotes
        });
        showToast(`AI Co-Writer drafted: ${generated.name} (${generated.title})`);
    };

    // Open Form for Edit
    const handleOpenEditChar = (char) => {
        setEditingChar(char);
        setFormData({ ...char });
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
            // Update
            setCharacters(prev => prev.map(c => c.id === editingChar.id ? { ...formData, id: c.id } : c));
            showToast(`Updated character: ${formData.name}`);
        } else {
            // Create
            const newChar = {
                ...formData,
                id: `char_${Date.now()}`
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
            id: `dl_${Date.now()}`,
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

    // Helper for tier badge color using User Palette (#f3e8ff, #3b2a5a, #ff9ec7, #ffd6e8, #c9b6ff)
    const getTierBadge = (tier) => {
        switch (tier) {
            case 'Protagonist':
                return 'bg-[#ff9ec7]/20 text-[#3b2a5a] border border-[#ff9ec7] shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
            case 'Main Target':
                return 'bg-[#c9b6ff]/30 text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
            case 'Supporting':
                return 'bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]/60 shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
            case 'Background':
                return 'bg-[#f3e8ff] text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
            case 'Deceased / MIA':
                return 'bg-[#ff9ec7]/30 text-[#3b2a5a] border border-[#ff9ec7] shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
            default:
                return 'bg-white text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_1px_2px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]';
        }
    };

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ characters, decisionLines }, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `omnicorp_narrative_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Downloaded narrative JSON file!");
    };

    const handleUploadJSON = (e) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (parsed.characters && Array.isArray(parsed.characters)) {
                        setCharacters(parsed.characters);
                    }
                    if (parsed.decisionLines && Array.isArray(parsed.decisionLines)) {
                        setDecisionLines(parsed.decisionLines);
                    }
                    showToast("Imported narrative data successfully!");
                } catch (err) {
                    alert("Invalid JSON file: " + err.message);
                }
            };
        }
    };

    // Helper to generate directory.js code format
    const generateDirectoryJsCode = () => {
        const dirEntries = characters.map(c => {
            const levelNum = c.clearance.includes('L3') ? 3 : (c.clearance.includes('L2') ? 2 : (c.clearance.includes('L1') ? 1 : 0));
            const isHead = c.tier === 'Main Target' || c.title.toLowerCase().includes('chief') || c.title.toLowerCase().includes('director');
            return `    { name: "${c.name}", title: "${c.title}", dept: "${c.dept}", id: "${c.badgeId}", status: "${c.status.toUpperCase().includes('ACTIVE') ? 'ACTIVE' : 'MIA'}", level: ${levelNum}, isHead: ${isHead} },`;
        }).join('\n');

        return `export const DIRECTORY_EMPLOYEES = [\n${dirEntries}\n];`;
    };

    if (!isAuthenticated) {
        return <StudioSecurityGate onAuthenticated={() => setIsAuthenticated(true)} />;
    }

    if (!isStandalone && !isOpen) return null;

    const rootClasses = isStandalone
        ? "h-screen w-full bg-[#f3e8ff] text-[#3b2a5a] flex flex-col font-sans overflow-hidden"
        : "fixed inset-0 z-[100] bg-[#f3e8ff]/98 backdrop-blur-md flex flex-col font-sans text-[#3b2a5a] overflow-hidden animate-in fade-in duration-200";

    return (
        <div className={rootClasses}>
            {/* TOAST */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[120] bg-[#3b2a5a] text-[#ffd6e8] px-4 py-2.5 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-2 border border-[#ff9ec7] animate-in slide-in-from-bottom-4">
                    <Sparkles size={16} className="text-[#ff9ec7]" />
                    {toastMessage}
                </div>
            )}

            {/* TOP HEADER */}
            <header className="h-16 bg-white/90 backdrop-blur-md border-b border-[#c9b6ff]/60 shadow-[0_2px_12px_rgba(59,42,90,0.05)] px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-b from-[#ffd6e8] to-[#ff9ec7]/40 text-[#3b2a5a] border border-[#ff9ec7] rounded-2xl shadow-[0_2px_6px_rgba(255,158,199,0.3),inset_0_1px_0_rgba(255,255,255,1)]">
                        <Users size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-[#3b2a5a] tracking-tight">NARRATIVE ARCHITECT // ROSTER & CLUE WEAVER</h2>
                            <span className="text-[10px] bg-[#ffd6e8] text-[#3b2a5a] px-2.5 py-0.5 rounded-full font-mono border border-[#ff9ec7] font-bold shadow-sm">DEV STUDIO</span>
                        </div>
                        <p className="text-xs text-[#3b2a5a]/70">Design OmniCorp employees, assign narrative tiers, and connect investigation decision lines</p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* View Switcher Tabs */}
                    <div className="bg-[#e9dcfa] p-1.5 rounded-2xl border border-[#c9b6ff] shadow-[inset_0_1.5px_3px_rgba(59,42,90,0.05)] flex text-xs">
                        <button
                            onClick={() => setActiveStudioTab('roster')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${activeStudioTab === 'roster' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                        >
                            <Users size={14} /> Character Roster ({counts.total})
                        </button>
                        <button
                            onClick={() => setActiveStudioTab('decision_tree')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${activeStudioTab === 'decision_tree' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                        >
                            <CornerDownRight size={14} /> Decision Lines ({counts.lines})
                        </button>
                        <button
                            onClick={() => setActiveStudioTab('graph')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${activeStudioTab === 'graph' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                        >
                            <Network size={14} /> Obsidian Graph Map
                        </button>
                        <button
                            onClick={() => setActiveStudioTab('export')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${activeStudioTab === 'export' ? 'bg-white text-[#3b2a5a] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#c9b6ff]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                        >
                            <FileText size={14} /> JSON Export
                        </button>
                        <button
                            onClick={() => setActiveStudioTab('plot_holes')}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${activeStudioTab === 'plot_holes' ? 'bg-[#3b2a5a] text-[#ffd6e8] shadow-[0_3px_8px_rgba(59,42,90,0.1),inset_0_1px_0_rgba(255,255,255,1)] border border-[#ff9ec7]' : 'text-[#3b2a5a]/70 hover:text-[#3b2a5a]'}`}
                        >
                            <AlertTriangle size={14} className={activeStudioTab === 'plot_holes' ? 'text-[#ff9ec7]' : 'text-[#3b2a5a]'} />
                            <span>Plot Holes & Continuity</span>
                        </button>
                    </div>

                    {/* Sync & AI Actions */}
                    <button
                        onClick={() => setIsSyncModalOpen(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-indigo-900 to-indigo-950 hover:from-indigo-800 hover:to-indigo-900 text-indigo-100 rounded-xl border border-indigo-400/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title="Sync with GitHub repository & local workspace"
                    >
                        <GitBranch size={14} className="text-indigo-300" /> Cloud Sync
                    </button>

                    <button
                        onClick={() => setIsNemotronOpen(!isNemotronOpen)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isNemotronOpen
                                ? 'bg-[#3b2a5a] text-[#ffd6e8] border-[#ff9ec7] shadow-[0_2px_8px_rgba(59,42,90,0.15)]'
                                : 'bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.04)]'
                        }`}
                        title="Toggle AI Co-Writer side panel"
                    >
                        <Bot size={14} className={isNemotronOpen ? 'text-[#ff9ec7]' : 'text-[#3b2a5a]'} />
                        <span>AI Co-Writer</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7]">NIM</span>
                    </button>

                    <button
                        onClick={handleResetToCanon}
                        title="Reset to Canon Defaults"
                        className="px-3 py-1.5 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>

                    <button
                        onClick={handleLockStudio}
                        className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-700 hover:text-red-800 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Lock Studio"
                    >
                        <Lock size={13} /> Lock
                    </button>

                    {isStandalone ? (
                        <a
                            href="./index.html"
                            className="px-3 py-1.5 bg-[#c9b6ff]/30 hover:bg-[#c9b6ff]/50 text-[#3b2a5a] border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ml-0.5"
                        >
                            <Building2 size={14} /> Intranet
                        </a>
                    ) : (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#ffd6e8]/50 text-[#3b2a5a] rounded-xl transition-colors ml-0.5"
                            title="Close Studio"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </header>

            {/* MAIN WORKSPACE: TAB CONTENT ON LEFT + DOCKED ASIDE TAB ON RIGHT */}
            <div className="flex-1 overflow-hidden flex flex-row">
                <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
                    {activeStudioTab === 'roster' && (
                    <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                        {/* ROSTER TOOLBAR */}
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
                            {/* Search and Filters */}
                            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search size={16} className="absolute left-3 top-3 text-[#3b2a5a]/50" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, ID, title, or clue..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl pl-9 pr-3 py-2 text-xs text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03),0_1px_0_rgba(255,255,255,1)]"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-[#3b2a5a]/50 hover:text-[#3b2a5a]">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Dept Filter */}
                                <select
                                    value={selectedDeptFilter}
                                    onChange={e => setSelectedDeptFilter(e.target.value)}
                                    className="bg-white border border-[#c9b6ff] rounded-xl px-3 py-2 text-xs text-[#3b2a5a] font-medium focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                >
                                    <option value="ALL">All Departments ({characters.length})</option>
                                    {DEPARTMENTS_LIST.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>

                                {/* Tier Filter */}
                                <select
                                    value={selectedRoleFilter}
                                    onChange={e => setSelectedRoleFilter(e.target.value)}
                                    className="bg-white border border-[#c9b6ff] rounded-xl px-3 py-2 text-xs text-[#3b2a5a] font-medium focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                >
                                    <option value="ALL">All Role Tiers</option>
                                    {ROLES_LIST.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setIsNemotronOpen(true);
                                    }}
                                    className="bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 border border-[#c9b6ff] shadow-xs transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                    title="Open AI Co-Writer to brainstorm or create characters"
                                >
                                    <Sparkles size={15} className="text-[#3b2a5a]" />
                                    <span>AI Co-Writer</span>
                                </button>

                                {/* Add Character Button (#ff9ec7 Vibrant Pastel Pink) */}
                                <button
                                    onClick={handleOpenAddChar}
                                    className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                >
                                    <Plus size={16} /> Add New Character
                                </button>
                            </div>
                        </div>

                        {/* STATS STRIP */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 shrink-0">
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Protagonist</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.protagonist}</span>
                            </div>
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Main Targets</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.main}</span>
                            </div>
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Supporting</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.supporting}</span>
                            </div>
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Background</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.background}</span>
                            </div>
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Deceased / MIA</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.deceased}</span>
                            </div>
                            <div className="bg-white/95 border border-[#c9b6ff] p-3 rounded-2xl text-center shadow-[0_2px_8px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
                                <span className="text-[10px] text-[#3b2a5a]/60 uppercase font-mono block">Decision Lines</span>
                                <span className="text-base font-bold text-[#3b2a5a]">{counts.lines}</span>
                            </div>
                        </div>

                        {/* ROSTER CARDS GRID */}
                        <div className="flex-1 overflow-y-auto pr-1">
                            {filteredCharacters.length === 0 ? (
                                <div className="h-64 flex flex-col items-center justify-center text-[#3b2a5a]/70 border border-dashed border-[#c9b6ff] rounded-3xl bg-white/70">
                                    <Users size={36} className="mb-2 opacity-40 text-[#c9b6ff]" />
                                    <p className="text-sm font-medium">No characters found matching current filters.</p>
                                    <button onClick={handleOpenAddChar} className="mt-3 text-xs text-[#3b2a5a] font-bold underline">
                                        + Add a new character now
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-12">
                                    {filteredCharacters.map(char => (
                                        <div
                                            key={char.id}
                                            onClick={() => setSelectedDossierChar(char)}
                                            className="bg-white/95 border border-[#c9b6ff] hover:border-[#ff9ec7] rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-[0_6px_20px_rgba(59,42,90,0.06),0_1px_3px_rgba(59,42,90,0.02),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)] hover:shadow-[0_10px_28px_rgba(255,158,199,0.22),inset_0_1.5px_0_rgba(255,255,255,1)] relative cursor-pointer hover:scale-[1.008]"
                                            title={`Click to open full dossier & AI story co-writer for ${char.name}`}
                                        >
                                            <div>
                                                {/* Card Header */}
                                                <div className="flex items-start justify-between gap-2 mb-2.5">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-bold text-[#3b2a5a] text-sm tracking-tight group-hover:text-[#ff4d94] transition-colors">{char.name}</h3>
                                                            <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2 py-0.5 rounded-lg border border-[#c9b6ff] shadow-sm font-bold">
                                                                ID: {char.badgeId}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-[#3b2a5a]/80 font-bold mt-0.5">{char.title}</p>
                                                    </div>

                                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenEditChar(char);
                                                            }}
                                                            className="p-1.5 bg-[#f3e8ff]/80 hover:bg-[#ffd6e8] text-[#3b2a5a] rounded-lg transition-all border border-[#c9b6ff]/60 hover:border-[#ff9ec7] cursor-pointer shadow-xs"
                                                            title="Edit character"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteChar(char.id, char.name);
                                                            }}
                                                            className="p-1.5 bg-[#fbf7ff] hover:bg-rose-50 text-[#3b2a5a]/60 hover:text-rose-600 rounded-lg transition-all border border-[#c9b6ff]/50 hover:border-rose-300 cursor-pointer shadow-xs"
                                                            title={`Delete ${char.name}`}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Dept & Tier Badges */}
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getTierBadge(char.tier)}`}>
                                                        {char.tier}
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2.5 py-0.5 rounded-full border border-[#c9b6ff]">
                                                        {char.dept}
                                                    </span>
                                                    <span className="text-[10px] font-mono bg-[#f3e8ff] text-[#3b2a5a] px-2.5 py-0.5 rounded-full border border-[#c9b6ff]">
                                                        {char.clearance}
                                                    </span>
                                                </div>

                                                {/* Clue Held (Soft Blush Milk Pink #ffd6e8) */}
                                                <div className="bg-gradient-to-r from-[#fff5f9] to-[#ffd6e8] p-3 rounded-xl border border-[#ff9ec7]/60 shadow-[0_2px_6px_rgba(255,158,199,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] mb-2.5">
                                                    <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-[#3b2a5a] block mb-1">
                                                        🔑 Clue / Credential Held:
                                                    </span>
                                                    <p className="text-xs text-[#3b2a5a] leading-relaxed font-sans">{char.clueHeld || 'None specified.'}</p>
                                                </div>

                                                {/* Message / Chat snippet */}
                                                {char.messageSnippet && (
                                                    <div className="bg-[#f3e8ff]/60 p-2.5 rounded-xl border border-[#c9b6ff]/60 text-[11px] text-[#3b2a5a]/80 italic mb-2">
                                                        "{char.messageSnippet}"
                                                    </div>
                                                )}
                                            </div>

                                            {/* Lore notes & Card Action Footer */}
                                            <div className="pt-2.5 border-t border-[#c9b6ff]/50 flex items-center justify-between gap-2 mt-auto">
                                                <div className="text-[10px] text-[#3b2a5a]/70 line-clamp-2 flex-1 group-hover:text-[#3b2a5a] transition-colors">
                                                    {char.loreNotes || 'Click to expand full dossier & co-write with AI...'}
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedDossierChar(char);
                                                        }}
                                                        className="px-2.5 py-1 bg-gradient-to-r from-[#ffd6e8] to-[#ffa8ce] hover:from-[#ffc4de] hover:to-[#ff9ec7] text-[#3b2a5a] text-[10px] font-bold rounded-lg border border-[#ff8dbb] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                                        title="Inspect full dossier and co-write story with AI"
                                                    >
                                                        <Sparkles size={11} className="text-[#3b2a5a]" /> Dossier
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenEditChar(char);
                                                        }}
                                                        className="px-2 py-1 bg-[#f3e8ff]/80 hover:bg-[#ffd6e8] text-[#3b2a5a] text-[10px] font-bold rounded-lg border border-[#c9b6ff]/70 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                                        title="Edit character details"
                                                    >
                                                        <Edit3 size={11} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteChar(char.id, char.name);
                                                        }}
                                                        className="p-1 text-[#3b2a5a]/40 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                                        title={`Delete ${char.name}`}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* DECISION TREE TAB */}
                {activeStudioTab === 'decision_tree' && (
                    <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 p-4 rounded-2xl border border-[#c9b6ff] shadow-[0_4px_16px_rgba(59,42,90,0.06),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)]">
                            <div>
                                <h3 className="text-sm font-bold text-[#3b2a5a] flex items-center gap-2">
                                    <CornerDownRight size={18} className="text-[#ff9ec7]" />
                                    Investigation Clue Pathway (Decision Lines)
                                </h3>
                                <p className="text-xs text-[#3b2a5a]/70">
                                    Defines how the protagonist navigates from one employee to another through discovered clues, unredacted reports, or hijacked sessions.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveStudioTab('graph')}
                                    className="px-3.5 py-2 bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] border border-[#c9b6ff] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_1px_3px_rgba(59,42,90,0.04),inset_0_1px_0_rgba(255,255,255,1)] transition-all"
                                >
                                    <Network size={14} /> Open Obsidian Graph Map
                                </button>
                                <button
                                    onClick={() => setIsLinkModalOpen(true)}
                                    className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all"
                                >
                                    <Plus size={16} /> Add Decision Line
                                </button>
                            </div>
                        </div>

                        {/* DECISION LINES TIMELINE / CHAIN */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-12">
                            {decisionLines.map((dl, idx) => {
                                const fromChar = characters.find(c => c.id === dl.fromCharId);
                                const toChar = characters.find(c => c.id === dl.toCharId);

                                return (
                                    <div
                                        key={dl.id}
                                        className="bg-white/95 border border-[#c9b6ff] shadow-[0_6px_20px_rgba(59,42,90,0.06),0_1px_3px_rgba(59,42,90,0.02),inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,182,255,0.3)] hover:shadow-[0_10px_28px_rgba(59,42,90,0.12),inset_0_1.5px_0_rgba(255,255,255,1)] hover:border-[#ff9ec7] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group transition-all relative"
                                    >
                                        {/* Step Number with beveled ring */}
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-[#ffd6e8] border border-[#ff9ec7] text-[#3b2a5a] font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-[0_2px_4px_rgba(255,158,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                {idx + 1}
                                            </div>

                                            {/* Pathway Visual with beveled chips */}
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <div className="bg-[#f3e8ff] px-3.5 py-2 rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)]">
                                                    <span className="font-bold text-[#3b2a5a] block">{fromChar ? fromChar.name : dl.fromCharId}</span>
                                                    <span className="text-[10px] text-[#3b2a5a]/70 block font-sans">{fromChar?.dept || 'Unknown'}</span>
                                                </div>

                                                <div className="text-[#ff9ec7] px-1 font-bold">
                                                    <ArrowRight size={16} />
                                                </div>

                                                <div className="bg-[#f3e8ff] px-3.5 py-2 rounded-xl border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)]">
                                                    <span className="font-bold text-[#3b2a5a] block">{toChar ? toChar.name : dl.toCharId}</span>
                                                    <span className="text-[10px] text-[#3b2a5a]/70 block font-sans">{toChar?.dept || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1 min-w-[200px] text-xs">
                                            <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className="font-bold text-[#3b2a5a] text-sm tracking-tight">{dl.stepName || 'Investigation Step'}</span>
                                                {dl.unlocksType && (
                                                    <span className="text-[10px] bg-[#ffd6e8] text-[#3b2a5a] border border-[#ff9ec7] px-2.5 py-0.5 rounded-full font-bold shadow-[0_1px_2px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                        {dl.unlocksType}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#3b2a5a]/80 mb-1 leading-relaxed text-[11px]"><span className="text-[#3b2a5a] font-bold">Action:</span> {dl.investigationAction}</p>
                                            <div className="bg-gradient-to-r from-[#fff5f9] to-[#ffd6e8] border border-[#ff9ec7]/60 p-2.5 rounded-xl text-[#3b2a5a] text-[11px] font-sans shadow-[0_1px_2px_rgba(255,158,199,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                                                <span className="text-[#3b2a5a] font-bold mr-1.5">🔑 Clue / Unlock:</span> {dl.clueDiscovered}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 self-end md:self-center">
                                            <button
                                                onClick={() => handleDeleteDecisionLine(dl.id)}
                                                className="p-2 hover:bg-[#ffd6e8] text-[#3b2a5a]/60 hover:text-[#3b2a5a] rounded-xl transition-colors border border-transparent hover:border-[#ff9ec7]"
                                                title="Delete decision step"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* OBSIDIAN GRAPH VIEW TAB */}
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

                {/* EXPORT JSON TAB */}
                {activeStudioTab === 'export' && (
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
                                    <input type="file" accept=".json" onChange={handleUploadJSON} className="hidden" />
                                </label>
                                <button
                                    onClick={handleDownloadJSON}
                                    className="bg-white hover:bg-[#ffd6e8]/40 text-[#3b2a5a] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#c9b6ff] shadow-[0_1px_3px_rgba(59,42,90,0.03),inset_0_1px_0_rgba(255,255,255,1)] transition-all"
                                >
                                    <Download size={14} /> Download JSON
                                </button>
                                <button
                                    onClick={() => {
                                        const code = generateDirectoryJsCode();
                                        navigator.clipboard.writeText(code);
                                        showToast("Copied directory.js code to clipboard!");
                                    }}
                                    className="bg-[#ffd6e8] hover:bg-[#ff9ec7]/40 text-[#3b2a5a] border border-[#ff9ec7] font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-[0_1px_3px_rgba(255,158,199,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all"
                                >
                                    <FileText size={14} /> Copy as directory.js Code
                                </button>
                                <button
                                    onClick={() => {
                                        const fullExport = {
                                            characters,
                                            decisionLines
                                        };
                                        navigator.clipboard.writeText(JSON.stringify(fullExport, null, 2));
                                        showToast("Copied full JSON to clipboard!");
                                    }}
                                    className="bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all"
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
                )}

                {/* PLOT HOLE AUDITOR TAB */}
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
                        onAddDecisionLine={(newLine) => {
                            setDecisionLines(prev => [...prev, newLine]);
                            showToast('Added decision line to story graph!');
                        }}
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
            {isFormOpen && (
                <div className="fixed inset-0 z-[110] bg-[#3b2a5a]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-[#c9b6ff] w-full max-w-xl rounded-3xl shadow-[0_20px_50px_rgba(59,42,90,0.2),inset_0_2px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-[#c9b6ff] flex justify-between items-center bg-[#f3e8ff]/50">
                            <h3 className="font-bold text-[#3b2a5a] text-sm flex items-center gap-2">
                                <Users size={16} className="text-[#ff9ec7]" />
                                {editingChar ? `Edit Character: ${editingChar.name}` : 'Add New Character to OmniCorp'}
                            </h3>
                            <div className="flex items-center gap-2">
                                {!editingChar && (
                                    <button
                                        type="button"
                                        onClick={handleAutoFillWithAI}
                                        className="px-3 py-1 bg-gradient-to-r from-[#ffd6e8] to-[#f3e8ff] hover:from-[#ffc4de] hover:to-[#ebd5ff] text-[#3b2a5a] border border-[#ff9ec7] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                                        title="Auto-generate a complete employee dossier using AI Co-Writer"
                                    >
                                        <Sparkles size={13} className="text-[#3b2a5a]" />
                                        <span>Auto-Fill with AI</span>
                                    </button>
                                )}
                                <button onClick={() => setIsFormOpen(false)} className="text-[#3b2a5a]/60 hover:text-[#3b2a5a] p-1 rounded-lg hover:bg-[#ffd6e8]/40 transition-colors cursor-pointer">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveChar} className="p-6 overflow-y-auto space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Sarah Kone"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Badge ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 7700"
                                        value={formData.badgeId}
                                        onChange={e => setFormData({ ...formData, badgeId: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 font-mono shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Department</label>
                                    <select
                                        value={formData.dept}
                                        onChange={e => setFormData({ ...formData, dept: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                    >
                                        {DEPARTMENTS_LIST.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Job Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Chief Auditor"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Narrative Tier / Role</label>
                                    <select
                                        value={formData.tier}
                                        onChange={e => setFormData({ ...formData, tier: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                    >
                                        {ROLES_LIST.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">Clearance Level</label>
                                    <select
                                        value={formData.clearance}
                                        onChange={e => setFormData({ ...formData, clearance: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                    >
                                        {CLEARANCE_LIST.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                                    🔑 Clue / Credential Held
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="What information, password, invoice, or residue does this character provide?"
                                    value={formData.clueHeld}
                                    onChange={e => setFormData({ ...formData, clueHeld: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                    Sample Email / Chat Snippet (Atmosphere & Noise)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. 'Did anyone leave bulk salt in conference room B?'"
                                    value={formData.messageSnippet}
                                    onChange={e => setFormData({ ...formData, messageSnippet: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                    Lore / Character Background
                                </label>
                                <input
                                    type="text"
                                    placeholder="Brief background notes"
                                    value={formData.loreNotes}
                                    onChange={e => setFormData({ ...formData, loreNotes: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div className="pt-4 border-t border-[#c9b6ff] flex justify-between items-center gap-2">
                                {editingChar ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const idToDelete = editingChar.id;
                                            const nameToDelete = editingChar.name;
                                            setIsFormOpen(false);
                                            handleDeleteChar(idToDelete, nameToDelete);
                                        }}
                                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 rounded-xl font-bold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                                        title="Delete this character permanently"
                                    >
                                        <Trash2 size={13} /> Delete Character
                                    </button>
                                ) : <div />}

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-4 py-2 bg-white text-[#3b2a5a] rounded-xl hover:bg-[#ffd6e8]/40 font-bold border border-[#c9b6ff] transition-all cursor-pointer text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all cursor-pointer text-xs"
                                    >
                                        <Save size={14} /> {editingChar ? 'Save Changes' : 'Create Character'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ADD DECISION LINE */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-[110] bg-[#3b2a5a]/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-[#c9b6ff] w-full max-w-xl rounded-3xl shadow-[0_20px_50px_rgba(59,42,90,0.2),inset_0_2px_0_rgba(255,255,255,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-[#c9b6ff] flex justify-between items-center bg-[#f3e8ff]/50">
                            <h3 className="font-bold text-[#3b2a5a] text-sm flex items-center gap-2">
                                <CornerDownRight size={16} className="text-[#ff9ec7]" />
                                Add Investigation Decision Line
                            </h3>
                            <button onClick={() => setIsLinkModalOpen(false)} className="text-[#3b2a5a]/60 hover:text-[#3b2a5a] p-1 rounded-lg hover:bg-[#ffd6e8]/40 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveDecisionLine} className="p-6 space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                        Source Character (Investigating As)
                                    </label>
                                    <select
                                        required
                                        value={linkData.fromCharId}
                                        onChange={e => setLinkData({ ...linkData, fromCharId: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                    >
                                        <option value="">-- Select Source --</option>
                                        {characters.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.dept})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                                        Target Character Discovered / Unlocked
                                    </label>
                                    <select
                                        required
                                        value={linkData.toCharId}
                                        onChange={e => setLinkData({ ...linkData, toCharId: e.target.value })}
                                        className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[0_1px_2px_rgba(59,42,90,0.03)]"
                                    >
                                        <option value="">-- Select Target --</option>
                                        {characters.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.dept})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                    Step Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Uncovering the Procurement Paper Trail"
                                    value={linkData.stepName}
                                    onChange={e => setLinkData({ ...linkData, stepName: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                    Investigation Action
                                </label>
                                <input
                                    type="text"
                                    placeholder="What does the player do? (e.g. Reads Sarah's email dispute with Lumbergh)"
                                    value={linkData.investigationAction}
                                    onChange={e => setLinkData({ ...linkData, investigationAction: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a] uppercase font-mono font-bold text-[10px] mb-1">
                                    Clue / Credential Discovered
                                </label>
                                <input
                                    type="text"
                                    placeholder="What clue is gained? (e.g. Finds PO-4412 for Cryo-Organ preservation)"
                                    value={linkData.clueDiscovered}
                                    onChange={e => setLinkData({ ...linkData, clueDiscovered: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div>
                                <label className="block text-[#3b2a5a]/70 uppercase font-mono font-bold text-[10px] mb-1">
                                    Unlocks Type / Tag
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Credentials, Terminal Backdoor, Vault PIN, Omega Seal"
                                    value={linkData.unlocksType}
                                    onChange={e => setLinkData({ ...linkData, unlocksType: e.target.value })}
                                    className="w-full bg-white border border-[#c9b6ff] rounded-xl p-2.5 text-[#3b2a5a] placeholder-[#3b2a5a]/40 focus:outline-none focus:border-[#ff9ec7] focus:ring-2 focus:ring-[#ff9ec7]/20 shadow-[inset_0_1px_2px_rgba(59,42,90,0.03)]"
                                />
                            </div>

                            <div className="pt-4 border-t border-[#c9b6ff] flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="px-4 py-2 bg-white text-[#3b2a5a] rounded-xl hover:bg-[#ffd6e8]/40 font-bold border border-[#c9b6ff] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-gradient-to-b from-[#ffa8ce] to-[#ff9ec7] hover:from-[#ff96c4] hover:to-[#f78bb8] text-[#3b2a5a] rounded-xl font-bold flex items-center gap-1.5 border border-[#ff8dbb] shadow-[0_4px_14px_rgba(255,158,199,0.35),inset_0_1.5px_0_rgba(255,255,255,0.8),inset_0_-2px_0_rgba(215,100,145,0.3)] transition-all"
                                >
                                    <Plus size={14} /> Add Line
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CLOUD SYNC & GITHUB MODAL */}
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

            {/* DETAILED CHARACTER DOSSIER & AI STORY CO-WRITER MODAL */}
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
