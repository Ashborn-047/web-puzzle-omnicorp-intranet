/**
 * Sector 7 R&D Lead / Scientist Profile - Ellen Ripley
 * 
 * @description Chief Scientist. MIA status.
 * Contains Black Files PIN clue in deleted message.
 */

export const rndLead = {
    id: '1979',
    pass: 'Omni1979',
    name: "Ellen Ripley",
    dept: "Xenobiology",
    role: "SCIENTIST",
    region: "SECTOR_7",
    clearance: "L2",
    permissions: ['dashboard', 'messages'],
    messages: [
        { id: 1, from: "Self", subject: "Survivor", body: "If anyone finds this, I'm hiding in the vents. The Code to the Black Files is my ID.", deleted: true }
    ]
};

/**
 * Overseer Profile
 * 
 * @description System-level access. OMEGA clearance.
 * The Overseer is not a person - it is a system-level observer.
 */
export const overseer = {
    id: 'X-1',
    pass: 'OmniX-1',
    name: "UNKNOWN",
    dept: "Sector 7",
    role: "SYSTEM_OBS",
    region: "SECTOR_7",
    clearance: "L3_INTERNAL",
    permissions: ['restricted', 'dashboard', 'directory', 'infrastructure', 'terminal', 'documents', 'finance', 'history'],
    messages: []
};
