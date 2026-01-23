/**
 * Clearance Levels
 * 
 * Ladder: L0 → L1 → L2 → L3 → L4 → L5 → LΩ
 */

export const CLEARANCE = {
    L0: 0, // External / Disposable
    L1: 1, // Junior Internal
    L2: 2, // Standard Internal
    L2_D: 2.5, // Delegated Internal (External, Approved)
    L3: 3, // Senior / Cross-Dept
    L4: 4, // Director / Executive
    L5: 5, // Strategic Oversight
    L_OMEGA: 6 // Classified
};

export const CLEARANCE_NAMES = {
    [CLEARANCE.L0]: 'L0',
    [CLEARANCE.L1]: 'L1',
    [CLEARANCE.L2]: 'L2',
    [CLEARANCE.L2_D]: 'L2-D',
    [CLEARANCE.L3]: 'L3',
    [CLEARANCE.L4]: 'L4',
    [CLEARANCE.L5]: 'L5',
    [CLEARANCE.L_OMEGA]: 'LΩ'
};

/**
 * Roles Enum
 */
export const ROLES = {
    AUDITOR: 'AUDITOR',
    FINANCE: 'FINANCE',
    SYSADMIN: 'SYSADMIN',
    ENGINEER: 'ENGINEER',
    HR: 'HR',
    R_AND_D: 'R_AND_D',
    SUPPLY_CHAIN: 'SUPPLY_CHAIN',
    TRANSPORT: 'TRANSPORT',
    MANAGEMENT: 'MANAGEMENT',
    LEADERSHIP: 'LEADERSHIP',
    SYSTEM: 'SYSTEM'
};

/**
 * Get clearance level from string
 */
export const getClearanceLevel = (clearanceStr) => {
    const map = {
        'L0': CLEARANCE.L0,
        'EXTERNAL': CLEARANCE.L0,
        'L1': CLEARANCE.L1,
        'L2': CLEARANCE.L2,
        'L2_D': CLEARANCE.L2_D,
        'L2-D': CLEARANCE.L2_D,
        'DELEGATED': CLEARANCE.L2_D,
        'L3': CLEARANCE.L3,
        'L4': CLEARANCE.L4,
        'L5': CLEARANCE.L5,
        'L_OMEGA': CLEARANCE.L_OMEGA,
        'OMEGA': CLEARANCE.L_OMEGA,
        'LΩ': CLEARANCE.L_OMEGA
    };
    return map[clearanceStr] ?? CLEARANCE.L0;
};

/**
 * Check if user has minimum clearance
 */
export const hasMinimumClearance = (userClearance, requiredClearance) => {
    const userLevel = typeof userClearance === 'number'
        ? userClearance
        : getClearanceLevel(userClearance);

    const required = typeof requiredClearance === 'number'
        ? requiredClearance
        : getClearanceLevel(requiredClearance);

    return userLevel >= required;
};

/**
 * Get clearance display name
 */
export const getClearanceName = (level) => {
    return CLEARANCE_NAMES[level] || 'UNKNOWN';
};

/**
 * Tab/Resource Permission Logic
 * Roles determine what is in the sidebar.
 * Clearance determines redaction/field visibility.
 */
export const ROLE_PERMISSIONS = {
    [ROLES.AUDITOR]: ['dashboard', 'messages', 'chat', 'finance', 'directory'],
    ['AUDITOR_TEMP']: ['dashboard', 'messages', 'chat', 'finance', 'directory'],
    [ROLES.FINANCE]: ['dashboard', 'messages', 'chat', 'finance', 'directory'],
    [ROLES.SYSADMIN]: ['dashboard', 'messages', 'chat', 'terminal', 'infrastructure', 'directory'],
    [ROLES.ENGINEER]: ['dashboard', 'messages', 'chat', 'terminal', 'infrastructure', 'directory'],
    [ROLES.HR]: ['dashboard', 'messages', 'chat', 'directory'],
    [ROLES.R_AND_D]: ['dashboard', 'messages', 'chat', 'documents', 'directory'],
    [ROLES.MANAGEMENT]: ['dashboard', 'messages', 'chat', 'finance', 'documents', 'directory'],
    [ROLES.LEADERSHIP]: ['dashboard', 'messages', 'chat', 'finance', 'documents', 'directory', 'classified'],
    [ROLES.SYSTEM]: [] // System accounts have no interactive permission
};

/**
 * Scoped Access Logic (HARD RULE)
 * - Delegated scope enforcement for L2_D
 * - Role-based permission fallback for internal users
 * - Clearance ONLY affects redaction, ROLE handles boundaries
 */
export const hasModuleAccess = (user, module) => {
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    if (!rolePermissions.includes(module)) return false;

    // CORE modules are always allowed if the role permits them
    const isCore = ['dashboard', 'messages', 'chat', 'directory'].includes(module);
    if (isCore) return true;

    // Delegated access (external) - Surgical scope for sensitive modules
    if (user.clearance === 'L2_D' || user.clearanceLevel === 'L2_D') {
        return user.clearanceScope?.includes(module);
    }

    // Internal users check
    const level = getClearanceLevel(user.clearance || user.clearanceLevel);
    return level !== undefined;
};
