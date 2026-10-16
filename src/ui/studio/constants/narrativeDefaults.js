// Pre-loaded Canon Characters
export const DEFAULT_CHARACTERS = [
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
export const DEFAULT_DECISION_LINES = [
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

export const ROLES_LIST = [
    'Protagonist',
    'Main Target',
    'Supporting',
    'Background',
    'Deceased / MIA',
    'Other'
];

export const DEPARTMENTS_LIST = [
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

export const CLEARANCE_LIST = [
    'L0 (EXTERNAL)',
    'L1 (INTERNAL)',
    'L2 (DEPT_SUPERVISOR)',
    'L3 (EXECUTIVE)',
    'L-OMEGA'
];

// Module-level ID and file generators (keeps component render pure)
export const createUniqueId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
export const getExportFilename = () => `omnicorp_narrative_${Date.now()}.json`;

// Tier badge styling helper
export const getTierBadge = (tier) => {
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
