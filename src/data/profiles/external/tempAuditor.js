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
        },
        {
            id: 100,
            from: "OmniCorp Finance Audit System",
            subject: "AUTO-REPLY: Submission Received [R-7718]",
            body: "The financial reconciliation for 'Travel' (April Week 4) has been received and queued for senior review.\n\nTransaction Count: 42\nAnomalies Flagged: 0\n\nReference ID: R-7718",
            date: "Yesterday"
        },
        {
            id: 99,
            from: "Sarah Kone — Internal Audit",
            subject: "Thanks for the quick turnaround on R-7718",
            body: "Hey, thanks for knocking that out so fast. Mark was breathing down my neck about the travel reconciliation. Everything looked clean on my first pass. \n\nI just sent over the May packets to your inbox. Let's try to get through those before the weekend audit lock.",
            date: "Yesterday"
        },
        {
            id: 97,
            from: "OmniCorp Finance Audit System",
            subject: "CONFIRMATION: Audit R-7715 Approved",
            body: "Submission R-7715 (Software & Licensing) has been verified and closed by Senior Management. No further action is required for this batch.",
            date: "3 days ago"
        },
        {
            id: 98,
            from: "IT Security Deployment",
            subject: "MANDATORY: Security Policy Refresher",
            body: "Our records indicate you have not yet completed the 'Digital Hygiene 2026' module. Access to sensitive financial nodes may be restricted if not completed by Friday.\n\nNote: All external contractors must use the provided SSO portal.",
            date: "2 days ago"
        },
        {
            id: 95,
            from: "Mark Thompson (Senior Auditor)",
            subject: "Re: April Batch Completion",
            body: "The April audit for Logistics has been successfully filed. No major discrepancies found. You'll be moving to the Procurement/Travel packets for May shortly. Good work on the reconciliation.",
            date: "4 days ago"
        },
        {
            id: 92,
            from: "OmniCorp HR Services",
            subject: "Annual Ethics & Compliance Signature",
            body: "Please acknowledge that you have read and understood the OmniCorp Confidentiality Agreement (Section 7.a - Non-Disclosure of Sector-Specific Operations). Click here to sign electronically.",
            date: "1 week ago"
        },
        {
            id: 88,
            from: "IT Support Desk",
            subject: "Ticket #88219: Regional Access Granted",
            body: "Access to HQ Finance databases has been provisioned for your temporary badge ID. If you experience latency while using the remote link, please contact the onsite technician.",
            date: "2 weeks ago"
        }
    ]
};
