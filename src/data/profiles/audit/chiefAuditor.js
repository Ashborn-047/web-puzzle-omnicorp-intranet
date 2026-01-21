/**
 * Chief Auditor Profile - Sarah Kone
 * 
 * @description Chief Internal Auditor. L2 clearance.
 * Dashboard: Risk Trendline, Suppressed Findings, Audit Override Log
 */

export const chiefAuditor = {
    id: '7700',
    pass: 'Omni7700',
    name: "Sarah Kone",
    dept: "Finance",
    role: "CHIEF_AUDITOR",
    region: "HQ",
    clearance: "L2",
    permissions: ['dashboard', 'finance', 'directory', 'messages', 'history'],
    messages: [
        { id: 1, from: "Director Vance", subject: "STOP", body: "Stop digging into the Apex Solutions invoices. That vendor is protected by Sector 7.", date: "2 days ago" }
    ]
};
