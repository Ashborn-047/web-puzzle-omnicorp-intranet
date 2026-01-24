/**
 * Act II Chats - STRICT CANON REWORK
 * 
 * 4 Phase Structure:
 * - Group A (Routine IT): Trust/normalcy.
 * - Group B (Engineering/R&D): Anomalies leak from others.
 * - Group C (HR/Facilities/Audit): Human cost via process.
 * - Group D (Final/Silence): David's disappearance.
 */

export const ACT2_CHATS = [
    // --- GROUP A: ROUTINE IT (6-8) ---
    {
        id: 'c_a2_01',
        name: 'IT Support-HQ',
        avatar: 'IT',
        role: 'Support Level 1',
        lastText: 'Yeah, nightly sync jobs. Normal.',
        messages: [
            { sender: 'David Bowman', text: 'Quick check — Node 06 CPU spike around 02:00?', time: '08:14' },
            { sender: 'IT Support-HQ', text: 'Yeah, nightly sync jobs. Normal. Node-00 also spiked. Sync 4112.', time: '08:16' },
            { sender: 'David Bowman', text: 'Thanks.', time: '08:17' }
        ],
        visibility: { progression: 0 }
    },
    {
        id: 'c_a2_02',
        name: 'SysAdmin-West',
        avatar: 'SW',
        role: 'Regional Admin',
        lastText: 'Europe-West is odd.',
        messages: [
            { sender: 'David Bowman', text: 'Quick question — approval logs centralized?', time: '09:02' },
            { sender: 'SysAdmin-West', text: 'Mostly. Some regional variance.', time: '09:05' },
            { sender: 'David Bowman', text: 'Which regions?', time: '09:07' },
            { sender: 'SysAdmin-West', text: 'Europe-West is odd. Authorizations clusters under ID-3124.', time: '09:10' }
        ],
        visibility: { progression: 5 }
    },

    // --- GROUP B: ENGINEERING / R&D (8-10) ---
    {
        id: 'c_a2_10',
        name: 'Facilities-Z7',
        avatar: 'F7',
        role: 'Maintenance Lead',
        lastText: 'Calibrated twice.',
        messages: [
            { sender: 'David Bowman', text: 'Facilities flagged shipment discrepancy for #P-9002.', time: '10:45' },
            { sender: 'Facilities-Z7', text: 'Weight sensors showed 18kg more than manifest.', time: '10:48' },
            { sender: 'David Bowman', text: 'Calibration issue?', time: '10:50' },
            { sender: 'Facilities-Z7', text: 'Calibrated twice. Intake weight is correct. Regional Ops (H. Venn) reclassified as residue.', time: '11:02' }
        ],
        visibility: { progression: 10 }
    },
    {
        id: 'c_a2_11',
        name: 'Bio Lab-S7',
        avatar: 'BL',
        role: 'Senior Researcher',
        lastText: 'Not us.',
        messages: [
            { sender: 'David Bowman', text: 'Do biological loads get adjusted post-delivery?', time: '13:20' },
            { sender: 'Bio Lab-S7', text: 'Not usually. Unless classification changes.', time: '13:24' },
            { sender: 'David Bowman', text: 'Who changes classification?', time: '13:26' },
            { sender: 'Bio Lab-S7', text: 'Not us. HQ Compliance oversight (4410).', time: '13:40' }
        ],
        visibility: { progression: 15 }
    },

    // --- GROUP C: HR / FACILITIES / LEGAL (6-8) ---
    {
        id: 'c_a2_20',
        name: 'HR Automation-HQ',
        avatar: 'HR',
        role: 'Process Logic v4',
        lastText: 'Current classification.',
        messages: [
            { sender: 'David Bowman', text: 'Attrition report for Sector 7 doesn’t match Facilities occupancy.', time: '14:15' },
            { sender: 'HR Automation-HQ', text: 'Numbers are correct.', time: '14:16' },
            { sender: 'David Bowman', text: 'Correct relative to which dataset?', time: '14:18' },
            { sender: 'HR Automation-HQ', text: 'Current classification. Batch 112 reclassified by E. Kovács (6193).', time: '14:25' }
        ],
        visibility: { progression: 20 }
    },
    {
        id: 'c_a2_21',
        name: 'Facilities-Ops',
        avatar: 'FO',
        role: 'Logistics Liaison',
        lastText: 'The site.',
        messages: [
            { sender: 'David Bowman', text: 'Land expansion request #882 — what’s it for?', time: '15:30' },
            { sender: 'Facilities-Ops', text: 'Buffer zone.', time: '15:32' },
            { sender: 'David Bowman', text: 'Around what?', time: '15:35' },
            { sender: 'Facilities-Ops', text: 'The site. Expansion Lead T. Reed signed off.', time: '15:45' }
        ],
        visibility: { progression: 25 }
    },

    // --- GROUP D: FINAL / SILENCE (3-4) ---
    {
        id: 'c_a2_30',
        name: 'Isaac Clarke',
        avatar: 'IC',
        role: 'Engineer (Maintenance)',
        lastText: 'No.',
        messages: [
            { sender: 'Isaac Clarke', text: 'You still need the logs?', time: '16:02' },
            { sender: 'David Bowman', text: 'Yes.', time: '16:05' },
            { sender: 'Isaac Clarke', text: 'Should I stop sending them?', time: '16:07' },
            { sender: 'David Bowman', text: 'No.', time: '16:10' }
        ],
        visibility: { progression: 30 }
    },
    {
        id: 'c_a2_31',
        name: 'M. Aris',
        avatar: 'MA',
        role: 'Procurement (EU-West)',
        lastText: 'Bowman?',
        messages: [
            { sender: 'M. Aris', text: 'David, the 9003 scaling shows 22kg over again. Venn said to ignore, but the total variance #4112 is hitting the cap.', time: '17:20' },
            { sender: 'M. Aris', text: 'You there?', time: '18:15' },
            { sender: 'M. Aris', text: 'David?', time: '09:00' }
        ],
        visibility: { archiveAccessed: true }
    }
];
