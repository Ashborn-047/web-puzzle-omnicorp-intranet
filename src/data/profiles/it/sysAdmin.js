/**
 * SysAdmin Profile - David Bowman
 * 
 * @description System Administrator. L2 clearance.
 * Dashboard: Active Sessions, Node Status, Silent Alerts
 * 
 * Note: This is the fraud suspect in the audit puzzle.
 * Authorizes payments to "Apex Sol." vendor.
 */

export const sysAdmin = {
    id: '9000',
    pass: 'Omni9000',
    name: "David Bowman",
    dept: "IT / Infra",
    role: "SYSADMIN",
    region: "HQ",
    clearance: "L3",
    status: "REMOVED",
    removalReason: "Reassignment pending internal review",
    permissions: ['dashboard', 'directory', 'terminal', 'infrastructure', 'history', 'messages'],
    messages: [
        { id: 1, from: "Apex Solutions", subject: "Invoice Paid", body: "Payment received for 'Logistics Analysis'. The biomass has been delivered to Node 666.", date: "2026-05-10" },
        { id: 2, from: "System", subject: "Alert", body: "SSH session detected from unexpected IP.", date: "2026-05-11" }
    ]
};

/**
 * Engineer Profile - Isaac Clarke
 */
export const engineer = {
    id: '1001',
    pass: 'Omni1001',
    name: "Isaac Clarke",
    dept: "Maintenance",
    role: "ENGINEER",
    region: "SECTOR_7",
    clearance: "L1",
    permissions: ['dashboard', 'messages', 'infrastructure'],
    messages: [
        { id: 1, from: "System", subject: "Ticket Closed", body: "Ticket 'Elevator full of blood' marked as Wont Fix." }
    ]
};
