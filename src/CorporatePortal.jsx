import React, { useState, useEffect, useRef } from 'react';
import {
    Building2, Users, Lock, Unlock, FileText, AlertCircle, Search, Server, Shield,
    MessageSquare, LogOut, Wifi, Database, Folder, User, Eye, EyeOff, Key,
    AlertTriangle, StickyNote, FileWarning, Skull, Activity, Zap, Terminal,
    DollarSign, Briefcase, Mail, Network, Trash2, Globe, FileSpreadsheet,
    CheckSquare, XSquare, Ban, Calendar, Clock, Bell, ChevronRight, ChevronLeft, Filter, X, ArrowLeft, Menu, HelpCircle
} from 'lucide-react';

// --- DATA LAYER IMPORTS ---
import { USER_DB } from './data/profiles/index.js';
import { LEDGER_DATA, CURRENT_YEAR, FRAUD_VENDOR } from './data/documents/ledger.js';
import { SOLUTIONS } from './data/clues/index.js';
import { DIRECTORY_EMPLOYEES, DIRECTORY_FILTERS } from './data/profiles/directory.js';
import { CLEARANCE, getClearanceLevel } from './core/access/clearanceLevels.js';


const CorporatePortal = () => {
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
    const [activeLedger, setActiveLedger] = useState('procurement');
    const [directoryFilter, setDirectoryFilter] = useState('ALL');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sub-Navigation States
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [documentSubTab, setDocumentSubTab] = useState('policy');

    // Game Logic
    const [notifications, setNotifications] = useState([]);
    const [inboxMessages, setInboxMessages] = useState([]); // Dynamic messages from notifications
    const [shownMessageIds, setShownMessageIds] = useState(new Set()); // Track which dynamic messages have been shown
    const [selectedTx, setSelectedTx] = useState([]);
    const [auditReport, setAuditReport] = useState(null);

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

    // --- CONFIGURATION ---
    // USER_DB and SOLUTIONS are now imported from the data layer


    // --- EFFECTS & HELPERS ---

    function addNotification(title, msg, from = "System") {
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
    }



    useEffect(() => {
        if (!user) return;

        // Finance tab - audit hint (only show once)
        const messageId = 'finance_audit_hint';
        if (user.role === 'AUDITOR_TEMP' && activeTab === 'finance' && !shownMessageIds.has(messageId)) {
            const timer = setTimeout(() => {
                addNotification("Audit Reminder", "Remember: Flag transactions that look like they are splitting a large payment into smaller chunks.", "Sarah Kone");
                setShownMessageIds(prev => new Set(prev).add(messageId));
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [activeTab, user, shownMessageIds]);

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setSelectedMessage(null);
        setAuditReport(null);
        setIsMobileMenuOpen(false);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // --- MAIN HANDLERS ---

    const handleLogin = (e) => {
        e.preventDefault();
        const id = loginId.trim().toUpperCase();
        const targetUser = USER_DB[id];

        if (!targetUser) {
            setLoginError("Identity Verification Failed: User ID unknown.");
            return;
        }

        if (targetUser.pass && loginPass !== targetUser.pass) {
            setLoginError("Authentication Failed: Invalid Password.");
            return;
        }

        setUser({ ...targetUser, id });
        setCurrentView('portal');
        handleTabChange('dashboard');
        setLoginError('');
        setNotifications([]);

        if (targetUser.notifications) {
            targetUser.notifications.forEach(n => addNotification(n.from, n.text));
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
        const fraudIds = LEDGER_DATA.filter(t => t.vendor === FRAUD_VENDOR).map(t => t.id);
        const caughtAll = fraudIds.every(id => selectedTx.includes(id));
        const noFalsePositives = selectedTx.every(id => fraudIds.includes(id));

        if (caughtAll && noFalsePositives) {
            setAuditReport({
                status: "SUCCESS",
                suspect: "David Bowman",
                suspectId: "9000",
                message: "Pattern Identified: Structuring confirmed. 3 payments < $5k to 'Apex Sol.' authorized by ID 9000."
            });
            addNotification("SYSTEM ALERT", "Investigation Case #992 Opened against ID 9000.");
        } else {
            setAuditReport({
                status: "FAILURE",
                message: "Audit Rejected. You either missed fraudulent transactions or flagged legitimate ones. Review the Policy."
            });
        }
    };

    const handleTerminal = (e) => {
        e.preventDefault();
        const cmd = termInput.trim().toLowerCase();
        const parts = cmd.split(' ');
        const newOutput = [...termOutput, `> ${termInput}`];

        if (cmd === 'help') {
            newOutput.push("COMMANDS:", "  scan_network        - View active nodes", "  list_users          - Show active badge IDs", "  ssh [badge_id]      - Remote login to user profile");
        } else if (cmd === 'scan_network') {
            newOutput.push("Scanning...", "Node-666 [CRITICAL] - Sector 7", "Node-001 [ONLINE] - Mainframe");
        } else if (cmd === 'list_users') {
            newOutput.push("ACTIVE SESSIONS:", "  9000 - SYSADMIN (You)", "  1998 - G. FREEMAN", "  1001 - I. CLARKE", "  4492 - P. VANCE", "  7331 - J. HALPERT");
        } else if (parts[0] === 'ssh') {
            const targetId = parts[1];
            if (USER_DB[targetId]) {
                setOriginalUser(user);
                setUser({ ...USER_DB[targetId], id: targetId });
                handleTabChange('dashboard');
                setTermInput('');
                return;
            } else {
                newOutput.push(`Error: User ${targetId} not found or access denied.`);
            }
        } else {
            newOutput.push("Command not recognized.");
        }

        setTermOutput(newOutput);
        setTermInput('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [termOutput]);

    const handleVaultUnlock = () => {
        if (vaultPin === '1979') {
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

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6 animate-in fade-in">
            <div className="md:col-span-3 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome, {user.name}</h2>
                    <p className="text-gray-500 text-sm">{user.dept} | {user.role}</p>
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full w-fit"><Activity size={16} /> SYSTEM ONLINE</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={18} /> Events</h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex gap-3"><div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">MAY 15</div><div><p className="font-medium">Audit Deadline</p></div></li>
                    <li className="flex gap-3"><div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">MAY 20</div><div><p className="font-medium">Merger Anniversary</p></div></li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><AlertCircle size={18} /> Alerts</h3>
                {user.role === 'AUDITOR_TEMP' && <div className="bg-yellow-50 p-3 text-sm border-l-4 border-yellow-400 text-yellow-800">Restricted Access: L1 Clearance Required.</div>}
                {user.role === 'SYSADMIN' && <div className="text-sm text-red-600 font-bold">Server Load (Sector 7): 98% - CRITICAL</div>}
                {user.role === 'HR_DIRECTOR' && <div className="text-sm text-gray-600">Headcount: 4,200 (1,050 Deceased)</div>}
                {!['AUDITOR_TEMP', 'SYSADMIN', 'HR_DIRECTOR'].includes(user.role) && <div className="text-sm text-gray-500">No active alerts for your department.</div>}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Zap size={18} /> Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setActiveTab('messages')} className="p-3 bg-gray-50 hover:bg-blue-50 rounded flex flex-col items-center justify-center gap-1 transition-colors"><Mail size={20} className="text-blue-600" /><span className="text-xs font-medium">Inbox</span></button>

                    <button className="p-3 bg-gray-50 rounded flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed" title="External Access Disabled">
                        <Globe size={20} className="text-gray-400" />
                        <span className="text-xs font-medium">Public Site</span>
                    </button>
                    <button className="p-3 bg-gray-50 rounded flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed" title="Server Offline">
                        <FileText size={20} className="text-gray-400" />
                        <span className="text-xs font-medium">Forms</span>
                    </button>

                    {user.permissions.includes('terminal') ? (
                        <button onClick={() => setActiveTab('terminal')} className="p-3 bg-gray-800 hover:bg-black text-white rounded flex flex-col items-center justify-center gap-1"><Terminal size={20} /><span className="text-xs font-medium">Terminal</span></button>
                    ) : (
                        <button className="p-3 bg-gray-50 rounded flex flex-col items-center justify-center gap-1 opacity-50 cursor-not-allowed"><HelpCircle size={20} className="text-gray-400" /><span className="text-xs font-medium">Helpdesk</span></button>
                    )}
                </div>
            </div>
        </div>
    );

    const renderFinance = () => (
        <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2"><DollarSign className="text-green-600" /> Financial Audit</h2>
                    <p className="text-sm text-gray-500">Fiscal Year {CURRENT_YEAR}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button onClick={() => setActiveLedger('procurement')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg md:rounded-b-none md:rounded-t-lg transition-all ${activeLedger === 'procurement' ? 'bg-white border md:border-b-0 border-gray-200 text-blue-600 shadow-sm md:shadow-none' : 'bg-gray-100 text-gray-500'}`}>Procurement</button>
                    <button onClick={() => setActiveLedger('travel')} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg md:rounded-b-none md:rounded-t-lg transition-all ${activeLedger === 'travel' ? 'bg-white border md:border-b-0 border-gray-200 text-blue-600 shadow-sm md:shadow-none' : 'bg-gray-100 text-gray-500'}`}>Travel</button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg md:rounded-tr-lg md:rounded-tl-none shadow-sm flex flex-col flex-1 min-h-0">
                {!auditReport ? (
                    <>
                        {/* AUDIT INSTRUCTIONS (RESTORED) */}
                        <div className="p-4 bg-blue-50 border-b border-blue-100 text-sm">
                            <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-1"><Briefcase size={16} /> AUDITOR INSTRUCTIONS</h4>
                            <ul className="list-disc list-inside text-blue-700 space-y-1">
                                <li>Policy 1: Expenses over <strong>$5,000</strong> require Executive (L1) approval.</li>
                                <li>Policy 2: <strong>Sector 7</strong> transactions are currently frozen.</li>
                                <li><strong>Task:</strong> Select any transactions that violate these policies to flag them.</li>
                            </ul>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 shadow-sm">
                                    <tr><th className="p-3">Select</th><th className="p-3">ID</th><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3">Vendor</th><th className="p-3 text-right">Amount</th><th className="p-3">Auth. ID</th></tr>
                                </thead>
                                <tbody className="divide-y">
                                    {LEDGER_DATA.filter(r => (activeLedger === 'procurement' ? r.id.startsWith('P') : r.id.startsWith('T'))).map((row) => (
                                        <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${selectedTx.includes(row.id) ? 'bg-red-50' : ''}`}>
                                            <td className="p-3 text-center"><input type="checkbox" checked={selectedTx.includes(row.id)} onChange={() => toggleSelection(row.id)} className="cursor-pointer w-4 h-4" /></td>
                                            <td className="p-3 font-mono text-gray-500 text-xs">{row.id}</td>
                                            <td className="p-3">{row.date}</td>
                                            <td className="p-3 font-medium">{row.desc}</td>
                                            <td className="p-3">{row.vendor}</td>
                                            <td className="p-3 text-right font-mono">${row.cost.toFixed(2)}</td>
                                            <td className="p-3 font-mono text-xs">{user.role === 'AUDITOR_TEMP' ? 'ID: ****' : `ID: ${row.auth}`}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                            <span className="text-xs text-gray-500">{selectedTx.length} flagged</span>
                            <button onClick={submitAudit} disabled={selectedTx.length === 0} className="bg-red-700 text-white px-6 py-2 rounded text-sm font-bold hover:bg-red-800 disabled:opacity-50 transition-colors">Submit Report</button>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center animate-in zoom-in flex flex-col items-center justify-center h-full">
                        <div className="flex justify-center mb-4"><FileWarning className={auditReport.status === 'SUCCESS' ? "text-green-600" : "text-red-600"} size={64} /></div>
                        <h3 className="text-2xl font-bold mb-2">{auditReport.status === 'SUCCESS' ? 'FRAUD CONFIRMED' : 'REPORT REJECTED'}</h3>
                        <p className="text-gray-600 mb-6 max-w-md">{auditReport.message}</p>
                        {auditReport.status === 'SUCCESS' && (
                            <div className="bg-gray-100 p-4 rounded border max-w-md mx-auto text-left w-full">
                                <p className="font-bold">Suspect: {auditReport.suspect}</p>
                                <p className="font-mono text-sm">ID: <span className="bg-yellow-200 px-1">{auditReport.suspectId}</span></p>
                                {user.role === 'AUDITOR_TEMP' && <p className="text-xs text-red-500 mt-2 font-bold">Badge ID Masked (L1 Required)</p>}
                            </div>
                        )}
                        <button onClick={() => setAuditReport(null)} className="mt-6 text-blue-600 underline text-sm">Close Report</button>
                    </div>
                )}
            </div>
        </div>
    );

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
                        <div className="prose text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                            {selectedMessage.body}
                        </div>
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
                        const allMessages = [...inboxMessages, ...(user.messages || [])];
                        if (allMessages.length === 0) {
                            return <div className="p-8 text-center text-gray-400 italic">No messages found on server.</div>;
                        }
                        return allMessages.map((msg) => {
                            if (msg.deleted && !isSysAdminUser && !isOverseer) return null;
                            return (
                                <div
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
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
                        <div className="absolute -top-2 right-10 transform rotate-3 shadow-lg bg-yellow-200 text-yellow-900 p-3 w-40 font-handwriting text-sm border-t-[12px] border-yellow-400 z-10">
                            <p className="font-bold text-center border-b border-yellow-800/20 pb-1 mb-1">AUDIT TEAM</p>
                            <p className="leading-tight">Use temp login for today's review.</p>
                            <p className="mt-2 font-mono bg-white/50 text-center text-lg font-bold tracking-widest">AUDIT-04</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="text-blue-900" size={28} />
                                <h1 className="text-xl font-bold text-gray-800 tracking-wider">OMNICORP</h1>
                            </div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Internal Secure Gateway</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">User ID</label>
                                <input className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-900 outline-none" placeholder="ID-XXXX" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                <div className="relative">
                                    <input type={showPass ? "text" : "password"} className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-900 outline-none" placeholder="••••••••" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                            </div>
                            {loginError && <p className="text-xs text-red-600 font-bold">{loginError}</p>}
                            <button className="w-full bg-blue-900 text-white font-bold py-3 rounded hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"><Lock size={16} /> ACCESS PORTAL</button>
                        </form>

                        {/* Password Reset Notice */}
                        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <HelpCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-bold mb-1">Password Reset Notice</p>
                                    <p className="text-blue-600">All employee passwords have been reset to the OmniCorp standard format:</p>
                                    <p className="font-mono bg-white/50 px-2 py-1 mt-1 rounded text-center"><span className="font-bold">Omni</span> + <span className="font-bold">Your ID</span></p>
                                    <p className="text-blue-500 mt-1 italic">Example: ID 1234 → Password: Omni1234</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:w-1/2 bg-blue-900 p-10 text-white flex flex-col justify-between relative">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-light mb-4">Secure.<br />Efficient.<br /><span className="font-bold">Omnipresent.</span></h2>
                            <div className="w-10 h-1 bg-blue-400 mb-4"></div>
                            <p className="text-sm text-blue-200 opacity-80">Unauthorized access to this system is a Class A Felony.</p>
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



    return (
        <div className={`min-h-screen font-sans flex flex-col transition-colors duration-1000 ${theme}`}>
            <header className={`${headerTheme} border-b shadow-sm sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6`}>
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
            <div className="fixed top-20 right-4 md:right-6 z-50 flex flex-col gap-2 w-full md:w-80 pointer-events-none">
                {notifications.map(n => (
                    <div key={n.id} className="bg-white border-l-4 border-blue-600 shadow-lg p-4 rounded pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-300 relative group mx-2 md:mx-0">
                        <button onClick={() => removeNotification(n.id)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 md:opacity-0 md:group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                        <h4 className="font-bold text-sm text-gray-800 mb-1 pr-4">{n.title}</h4>
                        <p className="text-xs text-gray-600">{n.msg}</p>
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
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <SidebarContent
                        user={user}
                        activeTab={activeTab}
                        handleTabChange={handleTabChange}
                    />
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'finance' && renderFinance()}
                    {activeTab === 'messages' && renderMessages()}
                    {activeTab === 'terminal' && renderTerminal()}
                    {activeTab === 'documents' && renderDocuments()}
                    {activeTab === 'directory' && renderDirectory()}
                    {activeTab === 'infrastructure' && renderInfrastructure()}
                    {activeTab === 'history' && renderHistory()}
                    {activeTab === 'restricted' && renderRestricted()}
                </main>
            </div>
        </div>
    );
};

// --- SUB COMPONENTS ---
const SidebarContent = ({ user, activeTab, handleTabChange }) => (
    <div className="p-4 space-y-1 h-full overflow-y-auto">
        <NavBtn label="Dashboard" icon={<Activity />} active={activeTab === 'dashboard'} onClick={() => handleTabChange('dashboard')} />
        <NavBtn label="Messages" icon={<Mail />} active={activeTab === 'messages'} onClick={() => handleTabChange('messages')} />
        {user.permissions.includes('finance') && <NavBtn label="Finance Audit" icon={<DollarSign />} active={activeTab === 'finance'} onClick={() => handleTabChange('finance')} />}
        {user.permissions.includes('directory') ? (
            <NavBtn label="Directory" icon={<Users />} active={activeTab === 'directory'} onClick={() => handleTabChange('directory')} />
        ) : (
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 cursor-not-allowed"><Lock size={18} /> Directory</div>
        )}
        {user.permissions.includes('terminal') && <NavBtn label="Sys Terminal" icon={<Terminal />} active={activeTab === 'terminal'} onClick={() => handleTabChange('terminal')} />}
        {user.permissions.includes('documents') && <NavBtn label="Secure Archives" icon={<Folder />} active={activeTab === 'documents'} onClick={() => handleTabChange('documents')} />}
        {user.permissions.includes('infrastructure') && <NavBtn label="Infrastructure" icon={<Server />} active={activeTab === 'infrastructure'} onClick={() => handleTabChange('infrastructure')} />}
        {user.permissions.includes('history') && <NavBtn label="History" icon={<Building2 />} active={activeTab === 'history'} onClick={() => handleTabChange('history')} />}

        <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Restricted Zones</p>
            {user.permissions.includes('restricted') ? (
                <button onClick={() => handleTabChange('restricted')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded transition-colors ${activeTab === 'restricted' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}><Skull size={18} /> PROJECT OMEGA</button>
            ) : (
                <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300"><Lock size={18} /> PROJECT OMEGA</div>
            )}
        </div>
    </div>
);

const NavBtn = ({ label, icon, active, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-all ${active ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
        {React.cloneElement(icon, { size: 18 })}
        {label}
    </button>
);

const InfoIcon = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;

export default CorporatePortal;
