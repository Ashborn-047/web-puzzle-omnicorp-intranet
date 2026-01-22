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
    notifications: [],
    messages: [
        {
            id: 201,
            from: "Mark Thompson (Senior Auditor)",
            subject: "Expenditure Packet — Group A (May)",
            body: "Please review attached expenditures for compliance with approval policy. Flag any deviations.",
            date: "Today",
            attachment: {
                type: "PACKET",
                name: "Packet_A_May.doc",
                categories: ["Procurement", "Travel", "Software & Licensing", "Facilities & Maintenance"]
            }
        },
        {
            id: 202,
            from: "Mark Thompson (Senior Auditor)",
            subject: "Expenditure Packet — Group B (May)",
            body: "Please review attached expenditures for compliance with approval policy. Flag any deviations.",
            date: "Today",
            attachment: {
                type: "PACKET",
                name: "Packet_B_May.doc",
                categories: ["R&D Equipment", "Cloud Infrastructure", "Security & Compliance"]
            }
        },
        {
            id: 203,
            from: "Mark Thompson (Senior Auditor)",
            subject: "Expenditure Packet — Group C (May)",
            body: "Please review attached expenditures for compliance with approval policy. Flag any deviations.",
            date: "Today",
            attachment: {
                type: "PACKET",
                name: "Packet_C_May.doc",
                categories: ["Consulting & Professional Services", "Logistics & Supply Chain", "Miscellaneous Operations"]
            }
        },
        {
            id: 101,
            from: "System",
            subject: "Session Access Confirmation",
            body: "This session has been authorized under External Audit Contract #E-4471.\n\nPlease complete any outstanding reviews before end of day.",
            date: "Today"
        }
    ]
};
