/**
 * HR Director Profile - Patricia Vance
 * 
 * @description HR Director. L2 clearance.
 * Dashboard: Attrition Stability, Psychological Load Index, Reassignment Queue
 * 
 * Contains BETA key clue in messages.
 */

export const hrDirector = {
    id: '4492',
    pass: 'Omni4492',
    name: "Patricia Vance",
    dept: "Human Resources",
    role: "HR_DIRECTOR",
    region: "HQ",
    clearance: "L2",
    permissions: ['dashboard', 'directory', 'documents', 'messages', 'history', 'restricted'],
    messages: [
        { id: 1, from: "System Admin", subject: "Sync Partition", body: "Batch partition for Sector 7 is 882. No manual override required.", date: "Jan 1" },
        { id: 2, from: "Legal", subject: "Interns", body: "Legal says we can't call them 'Livestock' anymore.", date: "Jan 4", deleted: true }
    ]
};
