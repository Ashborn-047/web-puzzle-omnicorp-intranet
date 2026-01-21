/**
 * Temp Auditor Profile
 * 
 * @description External temporary auditor - the player's entry point.
 * EXTERNAL clearance, ID-only login (no password).
 */

export const tempAuditor = {
    id: 'AUDIT-04',
    pass: null,
    name: "Temp Auditor",
    dept: "External Audit",
    role: "AUDITOR_TEMP",
    region: "HQ",
    clearance: "EXTERNAL",
    permissions: ['dashboard', 'finance', 'messages'],
    notifications: [
        { from: "System", text: "Directory Access: DENIED (L1 Clearance Required)" },
        { from: "Sarah Kone", text: "I've uploaded the Procurement Ledger. Look for 'Structuring' - payments just under $5k to avoid Exec approval." }
    ],
    messages: [
        { id: 1, from: "System", subject: "Welcome Guest", body: "Your temporary credentials allow access to Financial Modules only.", date: "Today" },
        { id: 2, from: "Sarah Kone", subject: "Audit Strategy", body: "We suspect someone in IT is siphoning funds. They are smart - they keep individual transactions under the $5,000 approval limit. Look for repeated payments to the same vendor.\n\n- Sarah Kone\nChief Internal Auditor\nBadge ID: 7700", date: "Yesterday" }
    ]
};
