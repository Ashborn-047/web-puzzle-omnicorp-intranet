/**
 * Act II Chats
 * 
 * 20-30 Chat logs escalating from routine IT to concern.
 * Soft-gated visibility rules:
 * - A: Routine (Clearance L2+)
 * - B: Pattern Rec (Clearance L3 or specific logs read)
 * - C: Concern (Progression > mid-point)
 */

export const ACT2_CHATS = [
    // PHASE A: Routine IT Support
    {
        id: 'chat_a_01',
        name: 'IT Support — Node 04',
        messages: [
            { sender: 'David Bowman', text: 'Latency spike on Node 666. Can you verify routing?', time: '08:15 AM' },
            { sender: 'IT Support', text: 'Checking... seeing heavy ingestion from Sector 7. Normalizing now.', time: '08:20 AM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_02',
        name: 'Facilities Mgmt',
        messages: [
            { sender: 'Facilities', text: 'Need additional cooling units for Sub-Level 4. Influx is exceeding design spec.', time: '09:45 AM' },
            { sender: 'David Bowman', text: 'Spec was updated last week. Submit procurement request P-105.', time: '09:50 AM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_03',
        name: 'HR Automation',
        messages: [
            { sender: 'HRBot', text: 'System ID 4412 flag: Termination protocol active. Please revoke access.', time: '11:00 AM' },
            { sender: 'David Bowman', text: 'Again? That’s the third this morning. Revoking.', time: '11:05 AM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_04',
        name: 'Payroll Helpdesk',
        messages: [
            { sender: 'Payroll', text: 'We have a mismatch on contractor IDs for the Apex Sol invoice. Can you verify?', time: '01:22 PM' },
            { sender: 'David Bowman', text: 'It’s a legacy classification. Ignore the mismatch.', time: '01:25 PM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_05',
        name: 'Security Ops',
        messages: [
            { sender: 'SecOps', text: 'Badge read 9000 in archive wing at 03:00 AM. Expected?', time: '08:00 AM' },
            { sender: 'David Bowman', text: 'Was troubleshooting correlation index latency. Log it as routine.', time: '08:05 AM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_06',
        name: 'Procurement',
        messages: [
            { sender: 'Procurement', text: 'Why is equipment manifest R-902 under L3 lock?', time: '10:15 AM' },
            { sender: 'David Bowman', text: 'Project Omega requirements. Refer to Phase 4 policy.', time: '10:20 AM' }
        ],
        visibility: { clearance: 'L2' }
    },
    {
        sender: 'IT Support', id: 'chat_a_07', name: 'IT Support', messages: [
            { sender: 'David Bowman', text: 'Server cluster H-9 is leaking packets to an unknown external relay.', time: '11:30 AM' },
            { sender: 'IT Support', text: 'Internal relay 0-0. Encryption is standard.', time: '11:35 AM' }
        ], visibility: { clearance: 'L2' }
    },
    {
        id: 'chat_a_08', name: 'HR Admin', messages: [
            { sender: 'HR Admin', text: 'David, we need to finalize the "Removal" classification for the last batch.', time: '02:00 PM' },
            { sender: 'David Bowman', text: 'I’ve processed the IDs. The system is clean.', time: '02:05 PM' }
        ], visibility: { clearance: 'L2' }
    },

    // PHASE B: Pattern Recognition
    {
        id: 'chat_b_01',
        name: 'Engineering Support',
        messages: [
            { sender: 'David Bowman', text: 'Have you noticed the attrition rate in Sector 7? It’s up 40% this month.', time: '09:00 AM' },
            { sender: 'Engineer Clarke', text: 'I just fix the pipes, Dave. If they leave, they leave.', time: '09:15 AM' }
        ],
        visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_02',
        name: 'Data Integrity',
        messages: [
            { sender: 'Data Specialist', text: 'There are phantom nodes appearing in the network map. Node-X, Node-Y...', time: '11:45 AM' },
            { sender: 'David Bowman', text: 'I’m seeing them too. They don’t have hardware addresses. Just... presence.', time: '11:50 AM' }
        ],
        visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_03',
        name: 'Legal Council',
        messages: [
            { sender: 'Legal', text: 'We need the raw logs for the May land acquisition near Sector 7.', time: '02:30 PM' },
            { sender: 'David Bowman', text: 'The logs were purged by Overseer protocol last night. I can’t recover them.', time: '02:35 PM' }
        ],
        visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_04',
        name: 'Bio-Research Lead',
        messages: [
            { sender: 'Bio-Lead', text: 'The biomass delivery for Node 666... the weight is wrong. Far too heavy.', time: '04:00 PM' },
            { sender: 'David Bowman', text: 'Verify the count. Check against employee attrition logs. Do they correlate?', time: '04:10 PM' }
        ],
        visibility: { clearance: 'L3' }
    },
    {
        sender: 'Engineer Clarke', id: 'chat_b_05', name: 'Engineering Support', messages: [
            { sender: 'David Bowman', text: 'Isaac, checking the equipment manifest. Why did we order 500 "containment units" for HR?', time: '05:00 PM' },
            { sender: 'Engineer Clarke', text: 'Maybe for the retirement party? Don\'t ask me.', time: '05:15 PM' }
        ], visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_06', name: 'IT Support', messages: [
            { sender: 'David Bowman', text: 'Security logs show multiple logins from IDs that were marked REMOVED.', time: '08:45 AM' },
            { sender: 'IT Support', text: 'System lag. The index hasn\'t updated.', time: '08:50 AM' }
        ], visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_07', name: 'Facilities Mgmt', messages: [
            { sender: 'Facilities', text: 'Sector 7 expansion is hitting the old graveyard site. Board says push through.', time: '10:00 AM' },
            { sender: 'David Bowman', text: 'Push through? There are 300 years of records there.', time: '10:05 AM' }
        ], visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_08', name: 'Accounting', messages: [
            { sender: 'Accountant', text: 'Apex Sol. isn\'t a logistics firm. They are a burial service.', time: '11:30 AM' },
            { sender: 'David Bowman', text: 'I know. Don\'t put that in the ticket.', time: '11:35 AM' }
        ], visibility: { clearance: 'L3' }
    },
    {
        id: 'chat_b_09', name: 'System Admin', messages: [
            { sender: 'David Bowman', text: 'Accessing the correlation index now. It\'s encrypted at L0. Why?', time: '01:00 PM' },
            { sender: 'System', text: 'Unauthorized inquiry detected. Logging session.', time: '01:05 PM' }
        ], visibility: { clearance: 'L3' }
    },

    // PHASE C: Concern, Cutoff
    {
        id: 'chat_c_01',
        name: 'Private Channel: DB/IC',
        messages: [
            { sender: 'David Bowman', text: 'Isaac. Don’t use the company net for this. They are building a digital grave.', time: '10:00 PM' },
            { sender: 'System', text: 'User David Bowman no longer active.', time: '10:02 PM' }
        ],
        visibility: { archiveAccessed: true }
    },
    {
        id: 'chat_c_02',
        name: 'IT Support',
        messages: [
            { sender: 'Tech 1', text: 'Where’s Bowman? His station is clear. Even his mug is gone.', time: '08:15 AM' },
            { sender: 'Tech 2', text: 'Status says Reassigned. Don’t ask. Just move his tickets to the queue.', time: '08:20 AM' }
        ],
        visibility: { progression: 50 }
    },
    {
        id: 'chat_c_03',
        name: 'HR Automation',
        messages: [
            { sender: 'HR Admin', text: 'Is the Bowman removal finalized?', time: '09:00 AM' },
            { sender: 'System', text: 'Protocol OMEGA-9. Status: REMOVED. Trace: NONE.', time: '09:05 AM' }
        ],
        visibility: { progression: 60 }
    },
    {
        id: 'chat_c_04', name: 'Unknown User', messages: [
            { sender: 'Unknown', text: 'He left the archive. He thought he was smart.', time: '11:00 PM' },
            { sender: 'Unknown', text: 'The Bait is set.', time: '11:05 PM' }
        ], visibility: { archiveAccessed: true }
    },
    {
        id: 'chat_c_05', name: 'System', messages: [
            { sender: 'System', text: 'Daily Attrition Report: 12 REMOVED. 0 ACTIVE.', time: '08:00 AM' }
        ], visibility: { progression: 70 }
    }
];
