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
        { id: 1, from: "Overseer", subject: "Codes", body: "Beta Key is 882. Do not write this down.", date: "Jan 1" },
        { id: 2, from: "Legal", subject: "Interns", body: "Legal says we can't call them 'Livestock' anymore.", date: "Jan 4", deleted: true }
    ]
};
