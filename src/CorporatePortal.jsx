import React, { useState, useEffect, useRef } from 'react';
import {
    Building2, Users, Lock, Unlock, FileText, AlertCircle, Search, Server, Shield,
    MessageSquare, LogOut, Wifi, Database, Folder, User, Eye, EyeOff, Key,
    AlertTriangle, StickyNote, FileWarning, Skull, Activity, Zap, Terminal,
    DollarSign, Briefcase, Mail, Network, Trash2, Globe, FileSpreadsheet,
    CheckSquare, XSquare, Ban, Calendar, Clock, Bell, ChevronRight, ChevronLeft, Filter, X, ArrowLeft, Menu, HelpCircle, Send
} from 'lucide-react';

// --- DATA LAYER IMPORTS ---
import { USER_DB } from './data/profiles/index.js';
import { LEDGER_DATA, CURRENT_YEAR } from './data/documents/ledger.js';
import { SOLUTIONS } from './data/clues/index.js';
import { DIRECTORY_EMPLOYEES, DIRECTORY_FILTERS } from './data/profiles/directory.js';
import { CLEARANCE, ROLES, ROLE_PERMISSIONS, getClearanceLevel, hasModuleAccess } from './core/access/clearanceLevels.js';
import { useGameState } from './core/gameState/hooks.js';
import { validateProcessAudit, validateSystemAudit } from './utils/auditHelpers.js';
import OverseerMessage from './ui/overlays/OverseerMessage.jsx';

// Dashboards
import AuditorDashboard from './ui/dashboards/AuditorDashboard.jsx';
import SysAdminDashboard from './ui/dashboards/SysAdminDashboard.jsx';
import HRDashboard from './ui/dashboards/HRDashboard.jsx';
import RnDDashboard from './ui/dashboards/RnDDashboard.jsx';
import ManagementDashboard from './ui/dashboards/ManagementDashboard.jsx';
import SystemDenialView from './ui/shared/SystemDenialView.jsx';

// Act II Data & Components
import { ACT2_CHATS } from './data/messages/act2_chats.js';
import { ACT2_EMAILS } from './data/messages/act2_emails.js';
import NotepadWidget from './ui/widgets/NotepadWidget.jsx';
import { STASH_FILES } from './data/documents/stash_files.js';


const CorporatePortal = () => {
    const { state, actions } = useGameState();
    // --- STATE ---
    const [currentView, setCurrentView] = useState('login');
    const [user, setUser] = useState(null);
    const [originalUser, setOriginalUser] = useState(null);

    // Login State
    const [loginId, setLoginId] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Navigation
    const [activeTab, setActiveTab] = useState('dashboard');
    const [activeLedger, setActiveLedger] = useState('Procurement');
    const [directoryFilter, setDirectoryFilter] = useState('ALL');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Sub-Navigation States
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [documentSubTab, setDocumentSubTab] = useState('policy');
    const [activePacket, setActivePacket] = useState(null);

    // Game Logic
    const [notifications, setNotifications] = useState([]);
    const [inboxMessages, setInboxMessages] = useState([]); // Dynamic messages from notifications
    const [shownMessageIds, setShownMessageIds] = useState(new Set()); // Track which dynamic messages have been shown
    const [selectedTx, setSelectedTx] = useState([]);
    const [auditReport, setAuditReport] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null); // Side panel detail
    const [activeEntity, setActiveEntity] = useState(null); // System Entity view
    const [activeOrgUnit, setActiveOrgUnit] = useState(null); // Org Unit view
    const [activeProfile, setActiveProfile] = useState(null); // Profile Hop view

    // Terminal Logic
    const [termInput, setTermInput] = useState('');
    const [termOutput, setTermOutput] = useState([
        "OmniOS v9.0.1 [SECURE SHELL]",
        "Type 'help' for available commands."
    ]);
    const messagesEndRef = useRef(null);

    // Vault Logic
    const [vaultPin, setVaultPin] = useState('');
    const [vaultUnlocked, setVaultUnlocked] = useState(false);

    // Final Puzzle
    const [keys, setKeys] = useState({ alpha: '', beta: '', gamma: '' });
    const [unlocked, setUnlocked] = useState(false);
    const [shake, setShake] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        {
            id: 'sarah-kone',
            name: 'Sarah Kone',
            avatar: 'SK',
            role: 'Internal Audit',
            lastText: 'Reporting for duty.',
            messages: [
                { id: 14, sender: 'Sarah Kone', text: 'Hey there. Welcome to the audit batch. Let me know if you spot anything... unusual.', time: '09:00 AM' },
                { id: 13, sender: 'Temp Auditor', text: 'Thanks Sarah. Just getting settled. This ledger looks massive compared to the last one.', time: '09:05 AM' },
                { id: 12, sender: 'Sarah Kone', text: 'It is. We had a systems consolidation last month. Most of it is noise, but Mark wants every line item verified.', time: '09:07 AM' },
                { id: 11, sender: 'Sarah Kone', text: 'Don\'t sweat it too much. Just flag the obvious policy skips and we\'ll be home by five.', time: '09:10 AM' },
                { id: 10, sender: 'Temp Auditor', text: 'Sarah, I just finished the R-7718 Travel batch. Reconciliation is complete.', time: 'Yesterday, 04:30 PM' },
                { id: 9, sender: 'Sarah Kone', text: 'Got it. I\'ll check it and push it to Mark for final sign-off. Nice work.', time: 'Yesterday, 04:35 PM' },
                { id: 8, sender: 'Temp Auditor', text: 'Wait, R-7715 (Software) was also confirmed? I just saw the system email.', time: 'Yesterday, 04:40 PM' },
                { id: 7, sender: 'Sarah Kone', text: 'Yeah, Mark closed that one out this morning. No issues found. We are on a roll.', time: 'Yesterday, 04:45 PM' }
            ]
        },
        {
            id: 'system-announcements',
            name: '#system-announcements',
            avatar: '#',
            role: 'Channel',
            lastText: 'Network stable.',
            messages: [
                { id: 1, sender: 'System', text: 'Scheduled maintenance for Node 06-B completed. Network stability at 99.8%.', time: 'Yesterday' },
                { id: 2, sender: 'System', text: 'LUNCH ORDER: The cafeteria is offering a 10% discount for Finance staff today. Use code OMNI-NOM.', time: 'Yesterday' },
                { id: 3, sender: 'System', text: 'Reminder: External contractors must submit daily logs by 18:00.', time: 'Yesterday' }
            ]
        },
        {
            id: 'it-support',
            name: 'IT Support',
            avatar: 'IT',
            role: 'System',
            lastText: 'System active.',
            messages: [
                { id: 5, sender: 'IT Support', text: 'Your remote audit workspace is now active. Please use SSO for all external logins.', time: 'Mon, 08:45 AM' },
                { id: 4, sender: 'Temp Auditor', text: 'Having trouble with the VPN handshake. It says certificate invalid?', time: 'Mon, 09:12 AM' },
                { id: 3, sender: 'IT Support', text: 'The HQ-9 cluster was rebooting. Try again now. Cleared it on my end.', time: 'Mon, 09:15 AM' },
                { id: 2, sender: 'Temp Auditor', text: 'That worked. Thanks!', time: 'Mon, 09:16 AM' },
                { id: 1, sender: 'IT Support', text: 'No problem. Welcome to the grid.', time: 'Mon, 09:17 AM' }
            ]
        }
    ]);
    const [selectedChatId, setSelectedChatId] = useState('sarah-kone');
    const [preparedReplies, setPreparedReplies] = useState([]);

    // --- CONFIGURATION ---
    // USER_DB and SOLUTIONS are now imported from the data layer


    // --- EFFECTS & HELPERS ---

    const addNotification = React.useCallback((title, msg, from = "System") => {
        const timestamp = Date.now();
        const id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

        // Add to popup notifications
        const newNotif = { id, title, msg, read: false };
        setNotifications(prev => [newNotif, ...prev]);

        // Also save to inbox messages
        const newInboxMsg = {
            id: timestamp,
            from: from,
            subject: title,
            body: msg,
            date: "Just now",
            isNew: true
        };
        setInboxMessages(prev => [newInboxMsg, ...prev]);
    }, []);

    // --- ACT I: EPHEMERAL CHAT PING ---
    const addChatPing = React.useCallback((from, text) => {
        const timestamp = Date.now();
        const id = `${timestamp}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotif = { id, title: from, msg: text, isChat: true };
        setNotifications(prev => [newNotif, ...prev]);

        // Save to persistent chat history
        setChatHistory(prev => {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const chatIndex = prev.findIndex(c => c.name === from || from.includes(c.name));

            if (chatIndex >= 0) {
                const updated = [...prev];
                updated[chatIndex] = {
                    ...updated[chatIndex],
                    lastText: text,
                    messages: [...updated[chatIndex].messages, { id: timestamp, sender: from.split(' — ')[0], text, time }]
                };
                return updated;
            } else {
                // New conversation
                const cleanId = from.split(' — ')[0].toLowerCase().replace(/\s+/g, '-');
                return [...prev, {
                    id: cleanId,
                    name: from.split(' — ')[0],
                    avatar: from.charAt(0),
                    role: 'OmniCorp User',
                    lastText: text,
                    messages: [{ id: timestamp, sender: from.split(' — ')[0], text, time }]
                }];
            }
        });

        // ACT I: Prepared Replies for Simulation
        if (from.includes("Sarah Kone")) {
            setPreparedReplies(["Acknowledged. I'm on it.", "Got it. I'll let you know if I find anything.", "Working on the May batch now."]);
        } else if (from.includes("IT Support")) {
            setPreparedReplies(["Received, confirming access now.", "Understood."]);
        }
    }, []);

    const sendQuickReply = React.useCallback((text) => {
        const timestamp = Date.now();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatHistory(prev => {
            const chatIndex = prev.findIndex(c => c.id === selectedChatId);
            if (chatIndex >= 0) {
                const updated = [...prev];
                updated[chatIndex] = {
                    ...updated[chatIndex],
                    lastText: text,
                    messages: [...updated[chatIndex].messages, { id: timestamp, sender: 'Temp Auditor', text, time }]
                };
                return updated;
            }
            return prev;
        });

        setPreparedReplies([]); // Clear after sending
    }, [selectedChatId]);



    useEffect(() => {
        if (!user) return;

        // --- ACT I: CHAT PINGS ---
        if (user.role === 'AUDITOR_TEMP' && activeTab === 'finance' && !shownMessageIds.has('finance_entry_ping')) {
            const timer = setTimeout(() => {
                addChatPing("Sarah Kone — Internal Audit", "Morning. You’re assigned the last procurement batch. Nothing urgent — just flag anything that doesn’t align with policy.");
                setShownMessageIds(prev => new Set(prev).add('finance_entry_ping'));
            }, 800);
            return () => clearTimeout(timer);
        }

        // --- ACT II: SARAH KONE RE-REVIEW ---
        if (state.progression.userClearance === 'AUDIT_L2' && activeTab === 'finance' && !shownMessageIds.has('act2_review_ping')) {
            const timer = setTimeout(() => {
                addChatPing("Sarah Kone — Internal Audit", "We have observed similar procedural variance in prior audits. Please re-review the attached expenditure packets and classify authorization sources where applicable.");
                setShownMessageIds(prev => new Set(prev).add('act2_review_ping'));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [activeTab, user, shownMessageIds, state.progression.userClearance, addChatPing]);

    // --- ACT II: NOTEPAD TRIGGER LOGIC ---
    useEffect(() => {
        const checkDavid = (u) => u?.id === '9000' || u?.role?.toUpperCase() === 'SYSADMIN';
        const isDavid = checkDavid(user) || checkDavid(originalUser);

        if (!isDavid || !selectedChatId) return;

        // Map chat IDs to notepad triggers
        const triggerMap = {
            'it-support': 'c_a2_01',
            'it-support-archives': 'c_a2_03', // New chat ID for archives
            'sysadmin-west': 'c_a2_02',
            'facilities-z7': 'c_a2_10',
            'facilities-log': 'c_a2_12',
            'bio-lab-s7': 'c_a2_11',
            'hr-automation': 'c_a2_20',
            'hr-reassignment': 'c_a2_22',
            'facilities-ops': 'c_a2_21',
            'isaac-clarke': 'c_a2_30',
            'm-aris': 'c_a2_31',
            'm-aris-final': 'c_a2_32'
        };

        const trigger = triggerMap[selectedChatId];
        if (trigger) {
            actions.unlockNotepadEntry(trigger);
        }
    }, [selectedChatId, user, originalUser, actions]);

    // --- ACT II: DOCUMENT TRIGGER LOGIC ---
    useEffect(() => {
        const checkDavid = (u) => u?.id === '9000' || u?.role?.toUpperCase() === 'SYSADMIN';
        const isDavid = checkDavid(user) || checkDavid(originalUser);

        if (isDavid && vaultUnlocked) {
            actions.unlockNotepadEntry('doc_attrition');
        }
    }, [vaultUnlocked, user, originalUser, actions]);
    useEffect(() => {
        if (selectedMessage) {
            const TRACE_MAP = {
                // Harold Venn Traces
                'e_a2_02': 'VENN', 'e_a2_05': 'VENN', 'e_a2_06': 'VENN', 'e_a2_07': 'VENN',
                // Mira Solanki Traces
                'e_a2_10': 'SOLANKI', 'e_a2_11': 'SOLANKI', 'e_a2_12': 'SOLANKI',
                // Thomas Reed Traces
                'e_a2_03': 'REED', 'e_a2_09': 'REED', 'e_a2_20': 'REED',
                // Elena Kovacs Traces
                'e_a2_13': 'KOVACS', 'e_a2_14': 'KOVACS', 'e_a2_21': 'KOVACS',
                // System ID 4112 Traces
                'e_a2_04': '4112', 'e_a2_22': '4112', 'e_a2_23': '4112', 'e_a2_25': '4112', 'e_a2_28': '4112'
            };

            const traceId = TRACE_MAP[selectedMessage.id];
            if (traceId) {
                actions.recordTrace(traceId);
            }
        }
    }, [selectedMessage, actions]);

    // --- ACT II: NOTEPAD PACING LOGIC ---
    useEffect(() => {
        const checkDavid = (u) => u?.id === '9000' || u?.role?.toUpperCase() === 'SYSADMIN';
        const isDavid = checkDavid(user) || checkDavid(originalUser);

        if (!isDavid) {
            setNotepadNotes([]);
            return;
        }

        const traceCount = state.progression.tracesFound?.length || 0;
        const entries = [
            "Log verification ongoing. All reclassifications must be grounded in facilities occupancy.", // 0: Baseline
            "Counts don’t match. Different departments. Same numbers.", // 1
            "If access disappears, correlation remains.", // 2
            "3124. 4410. 5021. They cluster by approval, not department.", // 3
            "Someone is reclassifying after the fact. Personnel status ACTIVE -> REMOVED.", // 4
            "The system doesn't answer to names. It answers to a habit.", // 5
            "4112. It's in the auth logs. It's in the variance signatures.", // 6
            "Pattern: 4112. Standard HQ protocol? Habit or system?", // 7
            "If you are reading this, I was already gone.", // 8
            "Do not finish what I started. Correlation is context. Scale is everything.", // 9
        ];

        let activeEntries = [entries[0]];
        if (traceCount >= 1) activeEntries.push(entries[1]);
        if (traceCount >= 2) activeEntries.push(entries[2]);
        if (traceCount >= 3) activeEntries.push(entries[3], entries[4]);
        if (traceCount >= 4) activeEntries.push(entries[5]);
        if (traceCount >= 5) activeEntries.push(entries[6], entries[7]);
        if (state.progression.archiveAccessed) activeEntries.push(entries[8], entries[9]);

        setNotepadNotes(activeEntries);
    }, [state.progression.tracesFound, state.progression.archiveAccessed, user, originalUser]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSelectedMessage(null);
        setAuditReport(null);
        setIsMobileMenuOpen(false);

        // Track behavior
        actions.switchRegion(newTab);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // --- MAIN HANDLERS ---

    const handleSSOLogin = () => {
        const targetUser = USER_DB['AUDIT-04'];
        if (!targetUser) return;

        setUser({ ...targetUser, id: 'AUDIT-04' });
        setCurrentView('portal');
        handleTabChange('dashboard');
        setLoginError('');
        setNotifications([]);

        if (targetUser.notifications) {
            targetUser.notifications.forEach(n => addNotification(n.from, n.text));
        }

        actions.accessProfile('AUDIT-04');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        const id = loginId.trim().toUpperCase();
        const targetUser = USER_DB[id];

        if (!targetUser) {
            setLoginError("Identity Verification Failed: User ID unknown.");
            return;
        }

        // --- INTERNAL LOGIN: PASSWORD REQUIRED ---
        if (targetUser.pass && loginPass !== targetUser.pass) {
            setLoginError("Authentication Failed: Invalid Password.");
            return;
        }

        // Successful login path
        let userData = { ...targetUser, id };

        // SILENT STATUS FLIP: David Bowman (9000)
        if (id === '9000' && state.progression.archiveAccessed) {
            userData.status = "REMOVED";
        }

        setUser(userData);
        setCurrentView('portal');
        handleTabChange('dashboard');
        setLoginError('');
        setNotifications([]);

        if (targetUser.notifications) {
            targetUser.notifications.forEach(n => addNotification(n.from, n.text));
        }

        // Track behavior: Login / Access Profile 
        actions.accessProfile(id);
    };
    const loadPacket = (packet) => {
        setActivePacket(packet);
        setActiveTab('finance');
        setSelectedMessage(null);
        setSelectedTx([]);
        setAuditReport(null);
        if (packet.categories && packet.categories.length > 0) {
            setActiveLedger(packet.categories[0]);
        }
    };

    const handleLogout = () => {
        setUser(null);
        setOriginalUser(null);
        setCurrentView('login');
        handleTabChange('dashboard');
        setVaultUnlocked(false);
        setUnlocked(false);
        setSelectedMessage(null);
        setInboxMessages([]);
        setNotifications([]);
        setShownMessageIds(new Set());
        setActivePacket(null);
        setSelectedTx([]);
        setAuditReport(null);
        setSelectedTransaction(null);
        setActiveEntity(null);
        setActiveOrgUnit(null);
        setActiveProfile(null);
    };

    const disconnectRemoteSession = () => {
        if (originalUser) {
            setUser(originalUser);
            setOriginalUser(null);
            handleTabChange('terminal');
        }
    };

    // --- PUZZLE LOGIC HANDLERS ---

    const toggleSelection = (id) => {
        if (selectedTx.includes(id)) {
            setSelectedTx(selectedTx.filter(t => t !== id));
        } else {
            setSelectedTx([...selectedTx, id]);
        }
    };

    const submitAudit = () => {
        const isAct2 = state.progression.userClearance === 'AUDIT_L2';

        const result = isAct2 ?
            validateSystemAudit(selectedTx, LEDGER_DATA, activePacket ? activePacket.categories : []) :
            validateProcessAudit(selectedTx, LEDGER_DATA, activePacket ? activePacket.categories : []);

        if (result.success) {
            actions.completeAudit();
            setAuditReport({
                status: "SUCCESS",
                message: result.message
            });

            if (isAct2) {
                setTimeout(() => {
                    addChatPing("Sarah Kone — Internal Audit", "Cross-departmental variance accepted. I've noted the systemic pattern.");
                }, 1000);
            } else {
                setTimeout(() => {
                    addChatPing("Sarah Kone — Internal Audit", "Good catch. That pattern’s shown up before. I’ll take a closer look.");
                }, 1000);
            }
        } else {
            setAuditReport({
                status: "FAILURE",
                message: result.message
            });
        }
    };

    const handleTerminal = (e) => {
        e.preventDefault();
        const cmd = termInput.trim().toLowerCase();
        const parts = cmd.split(' ');
        const newOutput = [...termOutput, `> ${termInput}`];

        // Terminal Constants
        const SYSTEM_PATH = '/sys/.vault/.correlation_index/';
        const SYSTEM_ID = '4112';
        const SYSTEM_PASS = 'Omni4112';

        if (cmd === 'help') {
            newOutput.push("OMNICORP SYSTEM TERMINAL v4.1", "COMMANDS:", "  scan_network        - View active nodes", "  list_users          - Show active badge IDs", "  ssh [badge_id]      - Remote login to user profile");
        } else if (cmd === 'scan_network') {
            newOutput.push("Scanning network infrastructure...", "Node-01 [HQ] - ONLINE", "Node-06 [EU-W] - ONLINE (Sync 4112)", "Node-07 [NA] - STANDBY", "Node-08 [EU-C] - HIGH LOAD");
        } else if (cmd === 'verify 4112') {
            newOutput.push("Verifying sync signature 4112...", "SOURCE: NODE-06", "RESULT: MATCH_FOUND", "TYPE: PERSISTENT_RESIDUE");
            actions.unlockNotepadEntry('term_verify_4112');
        } else if (cmd === 'list_users') {
            newOutput.push("ACTIVE SESSIONS:", "  9000 - David Bowman (SYSADMIN)", "  3124 - Harold Venn (RE-OPS)", "  4410 - Mira Solanki (COMPLIANCE)", "  5021 - Thomas Reed (INFRA-EX)");
        } else if (parts[0] === 'ssh') {
            const targetId = parts[1];
            if (USER_DB[targetId]) {
                actions.runTerminalCommand(`ssh ${targetId}`);
                setOriginalUser(user);
                setUser({ ...USER_DB[targetId], id: targetId });
                handleTabChange('dashboard');
                setTermInput('');
                return;
            } else {
                newOutput.push(`Error: Identity ${targetId} not verified in current cluster.`);
            }
        } else if (cmd === SYSTEM_PATH.slice(0, -1) || cmd === SYSTEM_PATH) {
            // SILENT LOG: Archive attempt
            actions.runTerminalCommand('access_archive_attempt');
            newOutput.push("SECURE ARCHIVE DETECTED.", "CREDENTIALS REQUIRED.", "ENTER SYSTEM ID:");
        } else if (termOutput[termOutput.length - 1] === "ENTER SYSTEM ID:") {
            if (termInput.trim() === SYSTEM_ID) {
                newOutput.push("> " + termInput);
                newOutput.push("SYSTEM ID VERIFIED. ENTER PASSWORD:");
            } else {
                newOutput.push("> " + termInput);
                newOutput.push("IDENTITY UNAUTHORIZED. ACCESS DENIED.");
            }
        } else if (termOutput[termOutput.length - 1] === "SYSTEM ID VERIFIED. ENTER PASSWORD:") {
            if (termInput.trim() === SYSTEM_PASS) {
                newOutput.push("> " + "*".repeat(termInput.length));
                newOutput.push("ACCESS GRANTED. INDEXING FRAGMENTS...");

                // Track Archive Accessed
                actions.recordArchiveAccessed();

                // Trigger Final Notepad Entry
                actions.unlockNotepadEntry('STASH_ACCESS');

                const availableFiles = ['README_FIRST.txt', 'open_questions.txt'];
                const traceCount = state.progression.tracesFound.length;
                if (traceCount >= 3) availableFiles.push('subordinate_map.txt');
                if (traceCount >= 6) availableFiles.push('l1_clusters.txt');
                // final_note is only after a specific flag or just always at the end? 
                // Spec say: "only after full credential puzzle completion" - which is now.
                availableFiles.push('final_note.txt');

                newOutput.push("Files indexed:", ...availableFiles.map(f => `  ${f}`));
            } else {
                newOutput.push("> " + "*".repeat(termInput.length));
                newOutput.push("PASSWORD INVALID. SILENT LOG TRIGGERED.");
            }
        } else if (parts[0] === 'cat') {
            const fileName = parts[1];
            if (state.progression.archiveAccessed) {
                const STASH = STASH_FILES;
                if (STASH[fileName]) {
                    // Check Gating
                    const traceCount = (state.progression.tracesFound || []).length;
                    let allowed = true;
                    if (fileName === 'subordinate_map.txt' && traceCount < 3) allowed = false;
                    if (fileName === 'l1_clusters.txt' && traceCount < 6) allowed = false;

                    if (allowed) {
                        newOutput.push(`FILE: ${fileName}`, "----------------", STASH[fileName]);

                        // Notepad triggers for reading specific files
                        if (fileName === 'l1_clusters.txt') actions.unlockNotepadEntry('doc_attrition');
                        if (fileName === 'final_note.txt') actions.unlockNotepadEntry('late_realization');
                        if (fileName === 'open_questions.txt') actions.unlockNotepadEntry('contradiction_check');
                    } else {
                        newOutput.push(`ERROR: Insufficient context to decrypt metadata correlation for ${fileName}. Found ${traceCount}/6 traces.`);
                    }
                } else {
                    newOutput.push(`Error: File ${fileName} not found.`);
                }
            } else {
                newOutput.push("Error: Filesystem access restricted.");
            }
        } else {
            newOutput.push("System trace complete. No command match.");
        }
        setTermOutput(newOutput);
        setTermInput('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [termOutput]);

    const handleVaultUnlock = () => {
        if (vaultPin === '1979') {
            actions.findClue('BLACK_FILES');
            setVaultUnlocked(true);
        } else {
            alert("ACCESS DENIED: PIN Incorrect.");
            setVaultPin('');
        }
    };

    const handleUnlockAttempt = () => {
        const isAlpha = keys.alpha.trim() === SOLUTIONS.ALPHA;
        const isBeta = keys.beta.trim() === SOLUTIONS.BETA;
        const isGamma = keys.gamma.toUpperCase().trim() === SOLUTIONS.GAMMA;

        if (isAlpha && isBeta && isGamma) {
            setUnlocked(true);
        } else {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            alert("CONTAINMENT BREACH: CODES INVALID.");
        }
    };

    // --- RENDER SECTIONS ---

    const renderDashboard = () => {
        const props = {
            user,
            onTabChange: handleTabChange,
            onLogout: handleLogout,
            notes: state.progression.notepadEntries
        };

        switch (user.role) {
            case ROLES.AUDITOR:
            case ROLES.FINANCE:
                return <AuditorDashboard {...props} />;
            case ROLES.SYSADMIN:
            case ROLES.ENGINEER:
                return <SysAdminDashboard {...props} />;
            case ROLES.HR:
                return <HRDashboard {...props} />;
            case ROLES.R_AND_D:
                return <RnDDashboard {...props} />;
            case ROLES.MANAGEMENT:
            case ROLES.LEADERSHIP:
                return <ManagementDashboard {...props} />;
            default:
                return <AuditorDashboard {...props} />;
        }
    };

    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    const renderFinance = () => {
        const pastReports = Array.from({ length: 15 }, (_, i) => {
            const idNumber = 7720 - i;
            let category = ['Procurement', 'Facilities', 'Services', 'Travel', 'Software'][i % 5];

            // Override for Lore Matching
            if (idNumber === 7718) category = 'Travel';
            if (idNumber === 7715) category = 'Software';

            return {
                id: `R-${idNumber}`,
                date: `2026-05-${12 - Math.floor(i / 3)}`,
                cat: category,
                status: 'APPROVED'
            };
        });

        const categories = activePacket ? activePacket.categories : [];
        const filteredData = LEDGER_DATA.filter(t => t.category === activeLedger);

        return (
            <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2"><DollarSign className="text-green-600" /> Finance Audit</h2>
                        <p className="text-sm text-gray-500">
                            {activePacket ? `Active Packet: ${activePacket.name}` : "Access via Expenditure Packet in Inbox"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                    {/* A. PREVIOUSLY SUBMITTED REPORTS */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
                        <div className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} /> History (ReadOnly)
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                            {pastReports.map(report => (
                                <div key={report.id} className="p-3 opacity-40">
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                        <span>{report.id}</span>
                                        <span>{report.date}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-gray-600 font-medium">{report.cat}</span>
                                        <span className="text-green-700 font-bold uppercase">{report.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* B. CURRENT PENDING REVIEW */}
                    <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
                        {/* Policy Panel - NEW PREMIUM DESIGN */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden shrink-0">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center text-white shadow-sm">
                                        <Briefcase size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Authorization</h3>
                                        <p className="text-sm font-bold text-gray-800">Expense Policy Summary</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsPolicyOpen(!isPolicyOpen)}
                                    className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-blue-600"
                                >
                                    {isPolicyOpen ? <ChevronLeft size={18} className="-rotate-90" /> : <ChevronRight size={18} className="rotate-90" />}
                                </button>
                            </div>
                            {isPolicyOpen && (
                                <div className="p-6 bg-white animate-in slide-in-from-top-4 fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { title: "Budget Limit", body: "Expenses over $5,000 require executive authorization", icon: <DollarSign size={14} /> },
                                            { title: "Documentation", body: "All expenses require documented request and verification", icon: <FileText size={14} /> },
                                            { title: "Workflow", body: "Direct authorization without request is prohibited", icon: <Activity size={14} /> }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-tight mb-1">{item.title}</p>
                                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{item.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audit Interface */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                            {!activePacket ? (
                                <div className="p-12 text-center h-full flex flex-col items-center justify-center text-gray-400">
                                    <FileText size={48} className="mb-4 opacity-20" />
                                    <p className="text-sm">Please open an <span className="font-bold text-gray-500 uppercase">Expenditure Packet</span> from the Inbox to begin your review.</p>
                                </div>
                            ) : !auditReport ? (
                                <>
                                    {/* Category Tabs */}
                                    <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200 no-scrollbar">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveLedger(cat)}
                                                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeLedger === cat ? 'bg-white border-blue-900 text-blue-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
                                            <thead className="bg-white text-gray-400 uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm border-b tracking-tighter">
                                                <tr>
                                                    <th className="p-3 w-8"></th>
                                                    <th className="p-3">ID / Date</th>
                                                    <th className="p-3">Vendor / Desc</th>
                                                    <th className="p-3">Amount</th>
                                                    <th className="p-3">Req By</th>
                                                    <th className="p-3">Ver By</th>
                                                    <th className="p-3">Auth By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 font-sans">
                                                {filteredData.map((row) => {
                                                    const isAct2 = state.progression.userClearance === 'AUDIT_L2';
                                                    const displayAuth = (isAct2 && row.authorizedBy === 'ID-9000') ? 'SYS-9000' : row.authorizedBy;

                                                    return (
                                                        <tr
                                                            key={row.transactionId}
                                                            className={`hover:bg-blue-50/30 transition-colors group ${selectedTx.includes(row.transactionId) ? 'bg-blue-50/50' : ''}`}
                                                            onClick={() => setSelectedTransaction(row)}
                                                        >
                                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedTx.includes(row.transactionId)}
                                                                    onChange={() => toggleSelection(row.transactionId)}
                                                                    className="cursor-pointer w-4 h-4 rounded text-blue-900 border-gray-300 focus:ring-blue-900 transition-all scale-110"
                                                                />
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-mono text-xs font-bold text-gray-900 mb-0.5 tracking-tight">{row.transactionId}</div>
                                                                <div className="text-[11px] text-gray-400 font-medium">{row.date}</div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="font-bold text-gray-900 text-sm mb-0.5 tracking-tight leading-none">{row.vendor}</div>
                                                                <div className="text-[11px] text-gray-500 font-medium italic truncate max-w-[200px]">{row.description}</div>
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <div className="font-mono font-black text-gray-900 text-sm">
                                                                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] font-mono text-gray-600 w-fit">
                                                                    {row.requestedBy}
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 uppercase font-bold w-fit tracking-tighter">
                                                                    {row.verifiedBy}
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                {displayAuth === 'SYS-9000' ? (
                                                                    <button
                                                                        className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded text-[10px] font-mono text-indigo-900 font-bold w-fit hover:bg-indigo-100 transition-colors cursor-pointer"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveEntity('SYS-9000');
                                                                        }}
                                                                    >
                                                                        {displayAuth}
                                                                    </button>
                                                                ) : (
                                                                    <div className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-[10px] font-mono text-blue-900 font-bold w-fit">
                                                                        {displayAuth}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
                                        <span className="text-[10px] text-gray-500 font-medium">{selectedTx.length} discrepancies flagged</span>
                                        <button
                                            onClick={submitAudit}
                                            disabled={selectedTx.length === 0}
                                            className="bg-blue-900 text-white px-6 py-1.5 rounded text-xs font-bold hover:bg-blue-800 disabled:opacity-30 disabled:grayscale transition-all shadow-sm uppercase tracking-widest"
                                        >
                                            Submit Report
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center animate-in zoom-in h-full flex flex-col items-center justify-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${auditReport.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {auditReport.status === 'SUCCESS' ? <CheckSquare size={32} /> : <AlertTriangle size={32} />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 font-mono uppercase tracking-tight">
                                        {auditReport.status === 'SUCCESS' ? 'Review Confirmed' : 'Submission Rejected'}
                                    </h3>
                                    <p className="text-gray-500 text-xs mb-8 leading-relaxed max-w-sm">
                                        {auditReport.message}
                                    </p>
                                    <button
                                        onClick={() => setAuditReport(null)}
                                        className="text-blue-900 font-bold text-[10px] uppercase tracking-widest hover:underline py-2 px-6 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        Return to Audit Queue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <TransactionDetailPanel
                        tx={selectedTransaction}
                        onClose={() => setSelectedTransaction(null)}
                        onViewEntity={(id) => setActiveEntity(id)}
                    />
                </div>
            </div>
        );
    };

    const renderMessages = () => {
        const isOverseer = user.role === 'OVERSEER';
        const isSysAdminUser = originalUser?.role === 'SYSADMIN';

        if (selectedMessage) {
            return (
                <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in">
                    <button
                        onClick={() => setSelectedMessage(null)}
                        className="flex items-center text-gray-600 hover:text-blue-700 mb-6 px-4 py-2 bg-white border rounded shadow-sm hover:shadow transition-all w-fit font-bold text-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Inbox
                    </button>
                    <div className="bg-white border rounded-lg shadow-sm p-6 md:p-8 flex-1 overflow-y-auto">
                        <div className="border-b pb-4 mb-6">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                            <div className="flex flex-col md:flex-row justify-between md:items-center text-sm text-gray-500 gap-1">
                                <span className="font-bold text-gray-700">From: {selectedMessage.from}</span>
                                <span>{selectedMessage.date}</span>
                            </div>
                            {selectedMessage.deleted && <div className="mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block font-bold">RECOVERED DELETED ITEM</div>}
                        </div>
                        <div className="prose text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base border-b pb-6 mb-6">
                            {selectedMessage.body}
                        </div>

                        {selectedMessage.attachment && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="text-green-600" size={24} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{selectedMessage.attachment.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedMessage.attachment.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => loadPacket(selectedMessage.attachment)}
                                    className="bg-blue-900 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-800 shadow-sm"
                                >
                                    OPEN ATTACHMENT
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2"><Mail size={24} /> Inbox: {user.name}</h2>
                <div className="bg-white border rounded-lg shadow-sm flex-1 overflow-y-auto divide-y">
                    {/* Combine dynamic inbox messages with static user messages */}
                    {(() => {
                        const allMessages = [
                            ...inboxMessages,
                            ...(user.messages || []),
                            ...ACT2_EMAILS.filter(e => {
                                // Volume logic: show if progression > 20 or if user is SysAdmin
                                if (originalUser?.role === 'SYSADMIN' || user.role === 'SYSADMIN') return true;
                                if (state.progression.archiveAccessed) return true;
                                return false; // Default: hide Act II emails until triggered
                            })
                        ];
                        if (allMessages.length === 0) {
                            return <div className="p-8 text-center text-gray-400 italic">No messages found on server.</div>;
                        }
                        return allMessages.map((msg) => {
                            if (msg.deleted && !isSysAdminUser && !isOverseer) return null;

                            // Link availability logic
                            const hasLink = msg.links && msg.links.length > 0;
                            const isLinkActive = hasLink && msg.links[0].status !== 'UNAVAILABLE' && msg.links[0].status !== 'REDACTED';

                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.deleted) actions.readDeletedMessage();
                                        const idStr = msg.id.toString();
                                        if (idStr.startsWith('email_') || idStr.startsWith('e_a2_')) {
                                            actions.recordDocumentViewed(msg.id);
                                        }
                                    }}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${msg.deleted ? 'bg-red-50 hover:bg-red-100' : ''} ${msg.isNew ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-sm text-gray-800">{msg.from}</span>
                                        <span className="text-xs text-gray-500">{msg.date}</span>
                                    </div>
                                    <div className="font-medium text-sm text-blue-600 mb-1 flex items-center gap-2">
                                        {msg.isNew && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">NEW</span>}
                                        {msg.subject}
                                        {msg.deleted && <Trash2 size={12} className="text-red-500" />}
                                        {hasLink && !isLinkActive && <span className="text-[10px] bg-gray-200 text-gray-500 px-1 rounded">BROKEN LINK</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{msg.body}</p>
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        );
    };

    const renderChat = () => {
        // Soft-gated chat selection
        const availableChats = [
            ...chatHistory,
            ...ACT2_CHATS.filter(c => {
                const checkSysAdmin = (u) => u?.role?.toUpperCase() === 'SYSADMIN' || u?.id === '9000';
                const isSysAdmin = checkSysAdmin(user) || checkSysAdmin(originalUser);

                if (isSysAdmin) return true; // SysAdmin sees all Act II chats

                const clearanceValue = getClearanceLevel(user.clearance || 'L1');
                const requiredClearance = c.visibility.clearance ? getClearanceLevel(c.visibility.clearance) : 0;

                if (c.visibility.clearance && clearanceValue < requiredClearance) return false;
                if (c.visibility.archiveAccessed && !state.progression.archiveAccessed) return false;

                // Progression check: using tracesFound count
                const tracesFound = state.progression.tracesFound?.length || 0;
                if (c.visibility.progression !== undefined && tracesFound < (c.visibility.progression / 5)) return false;

                return true;
            })
        ];

        const activeChat = availableChats.find(c => c.id === selectedChatId) || availableChats[0];

        return (
            <div className="flex h-full bg-white overflow-hidden animate-in fade-in">
                {/* Chat Sidebar */}
                <div className="w-1/4 min-w-[200px] border-r border-gray-100 flex flex-col bg-gray-50/30">
                    <div className="p-4 border-b bg-white">
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={16} className="text-blue-600" /> Channels
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="mb-4">
                            <p className="px-2 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Threads</p>
                            {availableChats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mb-1 ${selectedChatId === chat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-gray-600 hover:bg-white'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${selectedChatId === chat.id ? 'bg-blue-500' : 'bg-gray-200 text-gray-400'}`}>
                                        {chat.avatar || chat.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 text-left min-w-0 px-1">
                                        <p className="text-xs font-bold truncate">{chat.name}</p>
                                        <p className={`text-[10px] truncate ${selectedChatId === chat.id ? 'text-blue-100' : 'text-gray-400'}`}>{chat.lastText}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Message View */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                {activeChat.avatar || activeChat.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 leading-none mb-1">{activeChat.name}</h4>
                                <p className="text-xs text-gray-400 font-medium">{activeChat.role || 'OmniCorp User'} • Online</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                        {activeChat.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'Temp Auditor' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.sender === 'Temp Auditor' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <div className="flex justify-between items-center mb-1 gap-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${msg.sender === 'Temp Auditor' ? 'text-blue-100' : 'text-gray-400'}`}>{msg.sender}</span>
                                        <span className={`text-[10px] ${msg.sender === 'Temp Auditor' ? 'text-blue-200' : 'text-gray-400'}`}>{msg.time}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {preparedReplies.length > 0 && (
                        <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2">
                            {preparedReplies.map((reply, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendQuickReply(reply)}
                                    className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); }} className="p-4 border-t flex gap-3 bg-white">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                            disabled
                        />
                        <button type="button" className="p-2 bg-blue-600 text-white rounded-xl shadow-md opacity-50 cursor-not-allowed">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const renderTerminal = () => (
        <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4">
            <div className="flex-1 overflow-y-auto space-y-1 mb-4 custom-scrollbar">
                {termOutput.map((line, i) => <div key={i} className="break-all">{line}</div>)}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleTerminal} className="flex gap-2">
                <span className="text-green-700 shrink-0">{'>'}</span>
                <input autoFocus className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-900 w-full" placeholder="Enter command..." value={termInput} onChange={(e) => setTermInput(e.target.value)} />
            </form>
        </div>
    );

    const renderDocuments = () => (
        <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in">
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2"><Folder size={24} /> Secure Archives</h2>
            <div className="flex flex-col md:flex-row flex-1 border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="w-full md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r p-4 space-y-2">
                    <button onClick={() => setDocumentSubTab('policy')} className={`w-full text-left p-3 rounded text-sm font-medium flex items-center gap-2 ${documentSubTab === 'policy' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'}`}><FileText size={16} /> General Policies</button>
                    <button onClick={() => setDocumentSubTab('restricted')} className={`w-full text-left p-3 rounded text-sm font-medium flex items-center gap-2 ${documentSubTab === 'restricted' ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200'}`}><Lock size={16} /> Restricted (Black Files)</button>
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-8 overflow-y-auto">
                    {documentSubTab === 'policy' && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-700 border-b pb-2">Standard Operating Procedures</h3>
                            <p className="text-sm text-gray-600">All employees must change passwords weekly. Do not discuss Sector 7 outside of secure zones.</p>
                        </div>
                    )}
                    {documentSubTab === 'restricted' && (
                        <div className="border border-red-300 bg-red-50 p-6 rounded shadow-sm">
                            {!vaultUnlocked ? (
                                <div className="space-y-4 text-center">
                                    <Lock className="mx-auto text-red-500" size={48} />
                                    <h4 className="font-bold text-red-800">ENCRYPTED STORAGE</h4>
                                    <p className="text-sm text-red-700">Enter Security PIN (Chief Scientist ID)</p>
                                    <div className="flex gap-2 justify-center">
                                        <input type="text" maxLength={4} className="border p-2 rounded w-32 text-center tracking-widest" placeholder="????" value={vaultPin} onChange={(e) => setVaultPin(e.target.value)} />
                                        <button onClick={handleVaultUnlock} className="bg-red-600 text-white px-4 rounded hover:bg-red-700">UNLOCK</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-top duration-300">
                                    <h5 className="font-bold text-red-600 border-b pb-2 mb-4">FILE: PROJECT_OVERSEER</h5>
                                    <div className="bg-white p-4 rounded border border-red-200 space-y-2 text-sm">
                                        <p><strong>Subject 882 ID:</strong> <span className="font-mono bg-yellow-100 px-1">882</span> (Beta Key)</p>
                                        <div className="bg-black text-green-500 p-3 font-mono rounded mt-4">
                                            <p>OVERSEER CREDENTIALS:</p>
                                            <p>ID: X-1</p>
                                            <p>PASS: OmniX-1</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderDirectory = () => {
        const viewerLevel = getClearanceLevel(user.clearance);
        const viewerDept = user.dept.split(' ')[0].toLowerCase();
        const isOverseer = user.role === 'OVERSEER';

        return (
            <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold">Staff Directory</h2>
                    <div className="flex gap-2 flex-wrap">
                        {DIRECTORY_FILTERS.map(f => (
                            <button key={f} onClick={() => setDirectoryFilter(f)} className={`text-xs px-3 py-1 rounded-full border ${directoryFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                    {DIRECTORY_EMPLOYEES.filter(e => directoryFilter === 'ALL' || e.dept.includes(directoryFilter)).map((emp, i) => {
                        const isSelf = emp.id === user.id;
                        const isSameDept = emp.dept.toLowerCase().includes(viewerDept);

                        // Access Logic:
                        // 1. Overseer sees everything.
                        // 2. You see your own data.
                        // 3. You see IDs of people in your department IF you have equal or higher level.
                        // 4. Execs (L3+) see all IDs.
                        // 5. Otherwise, ID is redacted.
                        const canSeeId = isOverseer || isSelf || (isSameDept && viewerLevel >= (emp.level || 0)) || viewerLevel >= CLEARANCE.L3;

                        // Name Redaction:
                        // If it's a high level head in another department and you are a low-level auditor/intern, show [REDACTED NAME]
                        const hideName = !isOverseer && !isSelf && !isSameDept && emp.level > viewerLevel && viewerLevel < 2;

                        return (
                            <div key={i} className={`border p-4 rounded bg-white flex items-start gap-4 shadow-sm transition-all ${hideName ? 'opacity-70 grayscale' : ''}`}>
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                                    {hideName ? <Lock size={20} className="text-red-300" /> : <User size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 truncate">
                                            {hideName ? "█ █ █ █ █ █" : emp.name}
                                        </h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold whitespace-nowrap ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {emp.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-blue-600 truncate">{emp.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {emp.dept} | ID: {canSeeId ? emp.id : "█ █ █ █"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderHistory = () => (
        <div className="p-8 animate-in fade-in duration-300 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Corporate History</h2>
            <div className="relative border-l-2 border-red-200 pl-8 space-y-10">
                <div className="relative">
                    <div className="absolute -left-[41px] mt-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                    <h3 className="text-lg font-bold text-gray-800">1980 - The Impact</h3>
                    <div className="text-gray-600 mt-1 text-sm">An unknown object impacts the Nevada desert. <br /><span className="text-xs text-red-500 font-bold">*ALPHA KEY = 1980</span></div>
                </div>
                <div className="relative">
                    <div className="absolute -left-[41px] mt-1.5 w-4 h-4 rounded-full bg-red-500 border-4 border-white shadow-sm"></div>
                    <h3 className="text-lg font-bold text-gray-800">2000 - The Awakening</h3>
                    <div className="text-gray-600 mt-1 text-sm">Subject 882 wakes up. The first "glitches" appear in reality.</div>
                </div>
            </div>
        </div>
    );

    const renderInfrastructure = () => (
        <div className="flex flex-col h-full animate-in fade-in font-mono bg-slate-900 text-green-500">
            <div className="p-4 border-b border-opacity-20 border-white flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-2"><Activity size={16} /> <span className="font-bold">LIFE_SUPPORT_SYSTEMS</span></div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6 p-4 border border-dashed border-opacity-50 rounded bg-opacity-10 bg-white">
                    <h4 className="font-bold mb-1">DIAGNOSTIC LOG:</h4>
                    <p className="text-sm opacity-80">
                        The Containment Node in Sector 6 is failing (Temp &gt; 600°C).
                        <br />
                        <span className="text-yellow-500">MISSION: Find the ID of the failing node. It is the GAMMA KEY.</span>
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 24 }).map((_, i) => {
                        if (i === 14) return (
                            <div key={i} className="aspect-square border border-red-500 bg-red-900/20 flex flex-col items-center justify-center animate-pulse group relative">
                                <Database className="text-red-500" />
                                <span className="text-xs mt-1">ERR</span>
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-red-500 p-2 text-xs text-center z-10">
                                    <div className="font-bold text-red-500">NODE-666</div>
                                    <div>TEMP: 666°C</div>
                                </div>
                            </div>
                        );
                        return (
                            <div key={i} className="aspect-square border border-green-800 bg-green-900/10 flex flex-col items-center justify-center opacity-50 hover:opacity-100 transition-opacity group relative">
                                <Database className="text-green-700" />
                                <span className="text-xs mt-1">OK</span>
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-green-500 p-2 text-xs text-center z-10">
                                    <div className="font-bold text-green-500">NODE-{100 + i}</div>
                                    <div>TEMP: 45°C</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderRestricted = () => (
        <div className="flex-1 flex items-center justify-center p-8 bg-black/90 animate-in zoom-in duration-300">
            {!unlocked ? (
                <div className="bg-gray-900 text-red-500 p-8 rounded shadow-2xl border border-red-600 w-full max-w-lg">
                    <div className="text-center mb-8">
                        <Skull className="mx-auto text-red-600 mb-2 animate-pulse" size={48} />
                        <h2 className="text-2xl font-bold tracking-widest">PROJECT OMEGA</h2>
                        <p className="text-red-700 text-xs mt-1">INITIATE PURGE PROTOCOL</p>
                    </div>

                    <div className={`space-y-5 ${shake ? 'animate-pulse' : ''}`}>
                        <div>
                            <label className="block text-xs font-bold text-red-500 uppercase mb-1">Alpha Key (Impact Year)</label>
                            <input className="w-full bg-gray-900 border border-red-900 text-white p-3 rounded" value={keys.alpha} onChange={(e) => setKeys({ ...keys, alpha: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-500 uppercase mb-1">Beta Key (Subject ID)</label>
                            <input className="w-full bg-gray-900 border border-red-900 text-white p-3 rounded" value={keys.beta} onChange={(e) => setKeys({ ...keys, beta: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-500 uppercase mb-1">Gamma Key (Failing Node)</label>
                            <input className="w-full bg-gray-900 border border-red-900 text-white p-3 rounded" value={keys.gamma} onChange={(e) => setKeys({ ...keys, gamma: e.target.value })} />
                        </div>

                        <button onClick={handleUnlockAttempt} className="w-full bg-red-800 text-white font-bold py-4 rounded hover:bg-red-700 mt-6 uppercase tracking-widest">
                            <Zap size={16} className="inline mr-2" /> DETONATE REALITY
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-4xl bg-black text-white font-mono p-8 rounded border border-white relative h-[600px] flex flex-col items-center justify-center text-center">
                    <h1 className="text-6xl font-bold mb-4 text-red-500">REALITY PURGED</h1>
                    <p className="text-xl opacity-70 mb-8">The simulation has ended. You may now wake up.</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 border border-white hover:bg-white hover:text-black transition-colors">
                        REBOOT SYSTEM
                    </button>
                </div>
            )}
        </div>
    );

    // --- VIEW ROUTER ---

    if (currentView === 'login') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
                <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[500px]">
                    <div className="md:w-1/2 p-10 flex flex-col justify-center bg-gray-50 relative">
                        <div className="space-y-8">
                            {/* --- INTERNAL LOGIN --- */}
                            <div className="relative border-b pb-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Internal Employee Login</h3>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User ID</label>
                                        <input className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-900 outline-none text-sm" placeholder="ID-XXXX" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                        <div className="relative">
                                            <input type={showPass ? "text" : "password"} className="w-full border border-gray-300 p-2.5 rounded focus:ring-2 focus:ring-blue-900 outline-none text-sm" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                        </div>
                                    </div>
                                    {loginError && <p className="text-xs text-red-600 font-bold">{loginError}</p>}
                                    <button className="w-full bg-blue-900 text-white font-bold py-2.5 rounded hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 text-sm"><Lock size={14} /> ACCESS PORTAL</button>
                                </form>

                            </div>

                            {/* --- EXTERNAL / SSO LOGIN --- */}
                            <div className="relative pt-2">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">External / Contractor</h3>
                                <button
                                    onClick={handleSSOLogin}
                                    className="w-full bg-white border-2 border-blue-900 text-blue-900 font-bold py-2.5 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Network size={16} /> LOGIN WITH SSO
                                </button>

                            </div>
                        </div>

                        {/* Password Reset Notice */}
                        <div className="mt-12 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <HelpCircle size={14} className="text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-[10px] text-blue-800">
                                    <p className="font-bold mb-1 uppercase tracking-tighter">Password Reset Notice</p>
                                    <p className="text-blue-600">Employee passwords have been reset to: <span className="font-mono font-bold">Omni</span> + <span className="font-mono font-bold">ID</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 bg-blue-900 p-10 text-white flex flex-col justify-between relative">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-light mb-4 text-white">Secure.<br />Efficient.<br /><span className="font-bold">Omnipresent.</span></h2>
                            <div className="w-10 h-1 bg-blue-400 mb-8"></div>

                            {/* Administrative Bulletins */}
                            <div className="space-y-4 mb-12">
                                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-2">
                                    <Bell size={14} /> Administrative Bulletins
                                </h3>

                                <div className="bg-blue-800/40 p-3 rounded border border-blue-700/50 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-blue-200 uppercase">Internal Finance</span>
                                        <span className="text-[9px] text-blue-400 font-mono">22.01.26</span>
                                    </div>
                                    <p className="text-xs text-white leading-relaxed">Temp audit access for today. Final batch should already be queued.</p>
                                </div>

                                <div className="bg-blue-800/40 p-3 rounded border border-blue-700/50 backdrop-blur-sm">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-blue-200 uppercase">IT Infrastructure</span>
                                        <span className="text-[9px] text-blue-400 font-mono">22.01.26</span>
                                    </div>
                                    <p className="text-xs text-white leading-relaxed">External audits use SSO authentication. Do not issue temporary passwords.</p>
                                </div>
                            </div>

                            <p className="text-[10px] text-blue-400 opacity-80 uppercase tracking-tighter">Unauthorized access to this system is a Class A Felony.</p>
                        </div>
                        <div className="flex gap-3 opacity-30"><Globe /> <Server /> <Shield /></div>
                    </div>
                </div>
            </div>
        );
    }

    // --- LOGGED IN LAYOUT ---
    const isOverseer = user.role === 'OVERSEER';
    const isRemote = !!originalUser;
    const theme = isOverseer ? 'bg-black text-red-500' : 'bg-gray-100 text-slate-800';
    const headerTheme = isOverseer ? 'bg-red-900/20 border-red-900' : (isRemote ? 'bg-indigo-900 border-indigo-700 text-white' : 'bg-white border-gray-300');
    const accentColor = isOverseer ? 'text-red-500' : (isRemote ? 'text-white' : 'text-blue-700');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'finance':
                return hasModuleAccess(user, 'finance') ?
                    renderFinance() :
                    <SystemDenialView
                        reason="Financial Data Restricted"
                        clearanceRequired="L2 (DELEGATED_ACCESS)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'messages':
                return hasModuleAccess(user, 'messages') ?
                    renderMessages() :
                    <SystemDenialView
                        reason="Correspondence Restricted"
                        clearanceRequired="L1 (INTERNAL_ACCESS)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'chat':
                return hasModuleAccess(user, 'chat') ?
                    renderChat() :
                    <SystemDenialView
                        reason="Communication Channel Locked"
                        clearanceRequired="L1 (INTERNAL_ACCESS)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'terminal':
                return hasModuleAccess(user, 'terminal') ?
                    renderTerminal() :
                    <SystemDenialView
                        reason="Terminal Access Denied"
                        clearanceRequired="L2 (SYSADMIN_CREDENTIALS)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'documents':
                return hasModuleAccess(user, 'documents') ?
                    renderDocuments() :
                    <SystemDenialView
                        reason="Secure Archives Locked"
                        clearanceRequired="L3 (EXECUTIVE_ACCESS)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'directory': return renderDirectory();
            case 'infrastructure':
                return hasModuleAccess(user, 'infrastructure') ?
                    renderInfrastructure() :
                    <SystemDenialView
                        reason="Critical Infrastructure Locked"
                        clearanceRequired="L2 (ENGINEERING_CLEARANCE)"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            case 'history': return renderHistory();
            case 'restricted':
                return isOverseer ?
                    renderRestricted() :
                    <SystemDenialView
                        reason="OMEGA PROTOCOL RESTRICTED"
                        clearanceRequired="L-OMEGA"
                        onBack={() => handleTabChange('dashboard')}
                    />;
            default: return renderDashboard();
        }
    };


    return (
        <div className={`min-h-screen font-sans flex flex-col transition-colors duration-1000 ${theme}`}>
            <header className={`${headerTheme} border-b shadow-sm sticky top-0 z-50 h-16 flex items-center justify-between px-4 md:px-6 shrink-0`}>
                <div className="flex items-center gap-4">
                    <button className="md:hidden p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu size={24} /></button>
                    <div className="bg-blue-900 p-1.5 rounded text-white hidden sm:block"><Building2 size={20} /></div>
                    <h1 className="font-bold text-lg leading-none tracking-tight">OMNICORP <span className={accentColor}>{isOverseer ? 'CLASSIFIED' : (isRemote ? 'REMOTE LINK' : 'INTRANET')}</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-gray-700">{user.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase">{user.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isRemote && <button onClick={disconnectRemoteSession} className="text-xs font-bold bg-white text-indigo-900 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors animate-pulse"><Network size={14} className="inline mr-1" /> Disconnect</button>}
                        <button onClick={handleLogout} className="bg-gray-200 p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"><LogOut size={18} /></button>
                    </div>
                </div>
            </header>

            {/* NOTIFICATIONS */}
            <div className="fixed top-20 right-4 md:right-6 z-50 flex flex-col gap-2 w-full md:w-80 pointer-events-none font-sans">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        onClick={() => {
                            if (n.isChat) {
                                handleTabChange('chat');
                                const cleanId = n.title.split(' — ')[0].toLowerCase().replace(/\s+/g, '-');
                                setSelectedChatId(cleanId);
                            }
                            removeNotification(n.id);
                        }}
                        className={`
                            ${n.isChat ? 'bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500 scale-100 active:scale-95' : 'bg-white text-gray-800'} 
                            border-l-4 ${n.isChat ? 'border-indigo-400' : 'border-blue-600'} 
                            shadow-lg p-4 rounded-xl pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300 relative group transition-all mx-2 md:mx-0
                        `}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                            className={`absolute top-2 right-2 ${n.isChat ? 'text-indigo-200 hover:text-white' : 'text-gray-400 hover:text-gray-600'} md:opacity-0 md:group-hover:opacity-100 transition-opacity`}
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-center gap-2 mb-1">
                            {n.isChat && <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse"></div>}
                            <h4 className={`font-bold text-sm pr-4 truncate ${n.isChat ? 'text-indigo-100' : 'text-gray-800 uppercase tracking-tight'}`}>{n.title}</h4>
                        </div>
                        <p className={`text-xs ${n.isChat ? 'text-white' : 'text-gray-600'} line-clamp-2 leading-relaxed`}>{n.msg}</p>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* MOBILE SIDEBAR OVERLAY */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
                )}

                {/* SIDEBAR */}
                <aside className={`
          fixed md:relative inset-y-0 left-0 md:inset-y-auto z-[60] md:z-30 
          ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
          bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
          md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
                    <SidebarContent
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                        isCollapsed={isSidebarCollapsed}
                        setIsCollapsed={setIsSidebarCollapsed}
                        user={user}
                    />
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto bg-gray-50 no-scrollbar">
                    {(() => {
                        const checkDavid = (u) => u?.id === '9000' || u?.role?.toUpperCase() === 'SYSADMIN';
                        const isDavid = checkDavid(user) || checkDavid(originalUser);

                        if (isDavid) {
                            return (
                                <div className="grid grid-cols-1 md:grid-cols-4 h-full overflow-hidden">
                                    <div className="md:col-span-3 h-full overflow-y-auto no-scrollbar">
                                        {renderActiveTab()}
                                    </div>
                                    <div className="md:col-span-1 border-l border-gray-200 bg-white h-full flex flex-col overflow-hidden">
                                        <NotepadWidget notes={state.progression.notepadEntries} />
                                    </div>
                                </div>
                            );
                        }

                        return renderActiveTab();
                    })()}
                </main>
            </div>

            {/* OVERSEER OVERLAY */}
            {state.pendingOverseerMessage && (
                <OverseerMessage
                    message={state.pendingOverseerMessage}
                    onDismiss={actions.dismissOverseerMessage}
                />
            )}

            {/* ACT II OVERLAYS & VIEWS */}
            <SystemEntityDetailPanel
                entityId={activeEntity}
                onClose={() => setActiveEntity(null)}
                onViewOrgUnit={(unit) => {
                    setActiveEntity(null);
                    setActiveOrgUnit(unit);
                }}
            />

            {activeOrgUnit && (
                <ITOperationsPage
                    onClose={() => setActiveOrgUnit(null)}
                    onViewProfile={(p) => setActiveProfile(p)}
                />
            )}

            <SysAdminProfilePage
                profile={activeProfile}
                onClose={() => setActiveProfile(null)}
            />
        </div>
    );
};

// --- SUB COMPONENTS ---
const SidebarContent = ({ activeTab, handleTabChange, isCollapsed, setIsCollapsed, user }) => (
    <div className="flex flex-col h-full bg-white relative">
        {/* Toggle Button for Desktop */}
        <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm z-10 hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
        >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`p-4 ${isCollapsed ? 'px-2' : 'px-4'} flex-1 space-y-2 overflow-y-auto no-scrollbar pt-10`}>
            {/* Core Tabs - Always available if in permissions */}
            <NavBtn
                label="Dashboard"
                icon={<Activity />}
                active={activeTab === 'dashboard'}
                onClick={() => handleTabChange('dashboard')}
                isCollapsed={isCollapsed}
            />

            {ROLE_PERMISSIONS[user.role]?.includes('messages') && (
                <NavBtn
                    label="OmniMail"
                    icon={<Mail />}
                    active={activeTab === 'messages'}
                    onClick={() => handleTabChange('messages')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('chat') && (
                <NavBtn
                    label="OmniConnect"
                    icon={<MessageSquare />}
                    active={activeTab === 'chat'}
                    onClick={() => handleTabChange('chat')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('finance') && (
                <NavBtn
                    label="Finance Audit"
                    icon={<DollarSign />}
                    active={activeTab === 'finance'}
                    onClick={() => handleTabChange('finance')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('terminal') && (
                <NavBtn
                    label="SysTerminal"
                    icon={<Terminal />}
                    active={activeTab === 'terminal'}
                    onClick={() => handleTabChange('terminal')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('infrastructure') && (
                <NavBtn
                    label="Infrastructure"
                    icon={<Server />}
                    active={activeTab === 'infrastructure'}
                    onClick={() => handleTabChange('infrastructure')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('directory') && (
                <NavBtn
                    label="Directory"
                    icon={<Users />}
                    active={activeTab === 'directory'}
                    onClick={() => handleTabChange('directory')}
                    isCollapsed={isCollapsed}
                />
            )}

            {ROLE_PERMISSIONS[user.role]?.includes('documents') && (
                <NavBtn
                    label="Archives"
                    icon={<Folder />}
                    active={activeTab === 'documents'}
                    onClick={() => handleTabChange('documents')}
                    isCollapsed={isCollapsed}
                />
            )}

            <div className={`pt-6 mt-6 border-t border-gray-100 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>
                {!isCollapsed && <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Support</p>}
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-4'} py-2 text-blue-600/50`}>
                    <HelpCircle size={isCollapsed ? 20 : 16} />
                    {!isCollapsed && <span className="text-xs font-medium">Help Center</span>}
                </div>
            </div>
        </div>

        {!isCollapsed && (
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <div className="bg-blue-900/5 p-3 rounded-lg border border-blue-900/10">
                    <p className="text-[10px] font-bold text-blue-900 uppercase tracking-tighter mb-1">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] text-blue-800 font-medium tracking-tight whitespace-nowrap">Node 06-A Online</span>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const NavBtn = ({ label, icon, active, onClick, isCollapsed }) => (
    <button
        onClick={onClick}
        className={`
            w-full flex items-center group transition-all duration-200 rounded-lg relative
            ${isCollapsed ? 'justify-center py-3' : 'px-4 py-3 gap-3'}
            ${active ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-900/5' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
        `}
    >
        <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {React.cloneElement(icon, { size: isCollapsed ? 22 : 18 })}
        </div>

        {!isCollapsed && (
            <span className={`text-sm font-semibold tracking-tight transition-all duration-200 ${active ? 'translate-x-1' : ''}`}>
                {label}
            </span>
        )}

        {active && !isCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
        )}

        {/* Tooltip for Collapsed Sidebar */}
        {isCollapsed && (
            <div className="fixed left-20 bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] uppercase tracking-widest whitespace-nowrap shadow-xl">
                {label}
            </div>
        )}
    </button>
);

const InfoIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

// --- ACT II SUB-COMPONENTS ---

const TransactionDetailPanel = ({ tx, onClose, onViewEntity }) => {
    if (!tx) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-[70] border-l border-gray-200 animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 tracking-tight">Transaction Details</h3>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Core Information</h4>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Reference ID</p>
                            <p className="font-mono text-sm font-bold text-gray-900">{tx.transactionId}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-medium uppercase">Vendor / Description</p>
                            <p className="text-sm font-bold text-gray-900">{tx.vendor}</p>
                            <p className="text-xs text-gray-500 italic mt-0.5">{tx.description}</p>
                        </div>
                    </div>
                </section>

                <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <h4 className="text-[10px] font-bold text-blue-900/40 uppercase tracking-widest mb-3">Audit Metadata</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-blue-900/60 font-medium uppercase">Auth Source</p>
                            {tx.authSource ? (
                                <button
                                    className="text-xs font-mono font-bold text-blue-700 hover:underline text-left"
                                    onClick={() => onViewEntity(tx.authSource)}
                                >
                                    {tx.authSource}
                                </button>
                            ) : <p className="text-xs font-mono font-bold text-gray-400">REDACTED</p>}
                        </div>
                        <div>
                            <p className="text-[10px] text-blue-900/60 font-medium uppercase">Auth Type</p>
                            <p className="text-xs font-bold text-gray-800">{tx.authType || "Standard"}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-[10px] text-blue-900/60 font-medium uppercase">Approval Path</p>
                            <p className="text-xs font-medium text-gray-700 font-mono mt-1">{tx.approvalPath || "Direct Personnel Approval"}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const SystemEntityDetailPanel = ({ entityId, onClose, onViewOrgUnit }) => {
    if (!entityId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-lg"><Server size={20} /></div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none mb-1">System Entity: {entityId}</h3>
                            <div className="text-xs text-green-600 font-bold flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> ACTIVE</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Classification</p>
                            <p className="text-sm font-bold text-gray-800">Automated Exception Handler</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Scope</p>
                            <p className="text-sm font-bold text-gray-800">Cross-Departmental</p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Organizational Link</p>
                        <button
                            onClick={() => onViewOrgUnit('IT Operations')}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between group hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-900 border border-gray-100 group-hover:border-indigo-100 shadow-sm"><Users size={16} /></div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-gray-900">IT Operations Unit</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-medium">Maintenance & Infrastructure</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ITOperationsPage = ({ onClose, onViewProfile }) => {
    const itStaff = DIRECTORY_EMPLOYEES.filter(e => e.dept.includes('IT'));

    return (
        <div className="fixed inset-0 z-[110] bg-gray-50 overflow-y-auto animate-in slide-in-from-bottom duration-500">
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">IT Operations</h2>
                        <p className="text-xs text-gray-500 font-medium">Infrastructure & System Maintenance</p>
                    </div>
                </div>
            </header>
            <div className="max-w-4xl mx-auto p-6 md:p-10">
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="p-8 border-b bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Unit Overview</h3>
                        <p className="text-gray-700 leading-relaxed font-medium">The IT Operations unit manages the deployment, maintenance, and monitoring of all OmniCorp internal network services, including Automated Exception Handlers and cross-departmental record synchronization.</p>
                    </div>
                    <div className="p-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Linked Personnel</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {itStaff.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => onViewProfile(emp)}
                                    className="p-4 border rounded-xl flex items-center gap-4 hover:border-indigo-300 hover:bg-blue-50/30 transition-all text-left group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><User size={20} /></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-medium">{emp.title}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SysAdminProfilePage = ({ profile, onClose }) => {
    if (!profile) return null;

    return (
        <div className="fixed inset-0 z-[120] bg-white overflow-y-auto animate-in slide-in-from-right duration-500">
            <header className="bg-white border-b sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-gray-800">Personnel Profile</h2>
                </div>
            </header>
            <div className="max-w-2xl mx-auto p-6 md:p-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-24 h-24 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-xl border-4 border-white"><User size={48} /></div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                    <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">{profile.title}</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Employment Details</h3>
                        <div className="grid grid-cols-2 gap-y-6">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Department</p>
                                <p className="text-sm font-bold text-gray-900">{profile.dept}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Clearance Tier</p>
                                <p className="text-sm font-bold text-gray-900">L{profile.level || '?'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Status</p>
                                <p className="text-xs font-bold text-green-600">ACTIVE SESSION</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-medium mb-1">Last Access</p>
                                <p className="text-sm font-bold text-gray-900">Just Now</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100/50 rounded-2xl p-8 border border-dashed border-gray-300 flex flex-col items-center justify-center opacity-40 grayscale">
                        <Lock size={32} className="text-gray-400 mb-4" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Administrative Actions Locked</p>
                        <p className="text-[10px] text-gray-400 text-center max-w-xs">Your current clearance level (L1) does not permit interaction with L{profile.level} system resources.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporatePortal;
