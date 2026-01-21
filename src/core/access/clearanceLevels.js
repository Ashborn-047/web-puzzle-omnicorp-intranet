/**
 * Clearance Levels
 * 
 * Hierarchy: EXTERNAL → L1 → L2 → L3 → OMEGA
 * 
 * EXTERNAL (0): Temp Auditor - Limited access, ID-only login
 * L1 (1): Internal Staff - Basic employee access
 * L2 (2): Admin/Sys/HR - Department heads, sensitive data
 * L3 (3): Executive/Legal - Full corporate access
 * OMEGA (4): System-Level - Project Omega access
 */

export const CLEARANCE = {
    EXTERNAL: 0,
    L1: 1,
    L2: 2,
    L3: 3,
    OMEGA: 4
};

export const CLEARANCE_NAMES = {
    [CLEARANCE.EXTERNAL]: 'EXTERNAL',
    [CLEARANCE.L1]: 'L1',
    [CLEARANCE.L2]: 'L2',
    [CLEARANCE.L3]: 'L3',
    [CLEARANCE.OMEGA]: 'OMEGA'
};

/**
 * Get clearance level from string
 */
export const getClearanceLevel = (clearanceStr) => {
    const map = {
        'EXTERNAL': CLEARANCE.EXTERNAL,
        'L1': CLEARANCE.L1,
        'L2': CLEARANCE.L2,
        'L3': CLEARANCE.L3,
        'OMEGA': CLEARANCE.OMEGA
    };
    return map[clearanceStr] ?? CLEARANCE.EXTERNAL;
};

/**
 * Check if user has minimum clearance
 */
export const hasMinimumClearance = (userClearance, requiredClearance) => {
    const userLevel = typeof userClearance === 'string'
        ? getClearanceLevel(userClearance)
        : userClearance;
    const required = typeof requiredClearance === 'string'
        ? getClearanceLevel(requiredClearance)
        : requiredClearance;
    return userLevel >= required;
};

/**
 * Get clearance display name
 */
export const getClearanceName = (level) => {
    return CLEARANCE_NAMES[level] || 'UNKNOWN';
};

/**
 * Clearance requirements for resources
 */
export const RESOURCE_CLEARANCE = {
    dashboard: CLEARANCE.EXTERNAL,
    messages: CLEARANCE.EXTERNAL,
    finance: CLEARANCE.EXTERNAL,
    directory: CLEARANCE.L1,
    documents: CLEARANCE.L1,
    infrastructure: CLEARANCE.L1,
    terminal: CLEARANCE.L2,
    history: CLEARANCE.L1,
    restricted: CLEARANCE.L2  // But also requires explicit permission
};
