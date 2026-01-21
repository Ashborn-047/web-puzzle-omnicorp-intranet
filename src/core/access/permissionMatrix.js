/**
 * Permission Matrix
 * 
 * Maps roles to their available permissions and clearance levels.
 * Permissions are explicit grants beyond clearance-based access.
 */

import { CLEARANCE } from './clearanceLevels.js';

export const PERMISSIONS = {
    DASHBOARD: 'dashboard',
    FINANCE: 'finance',
    DIRECTORY: 'directory',
    MESSAGES: 'messages',
    TERMINAL: 'terminal',
    DOCUMENTS: 'documents',
    INFRASTRUCTURE: 'infrastructure',
    HISTORY: 'history',
    RESTRICTED: 'restricted'
};

/**
 * Role definitions with clearance and permissions
 */
export const ROLES = {
    AUDITOR_TEMP: {
        clearance: CLEARANCE.EXTERNAL,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.FINANCE, PERMISSIONS.MESSAGES],
        description: 'External temporary auditor'
    },
    CHIEF_AUDITOR: {
        clearance: CLEARANCE.L2,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.FINANCE, PERMISSIONS.DIRECTORY, PERMISSIONS.MESSAGES, PERMISSIONS.HISTORY],
        description: 'Chief Internal Auditor'
    },
    SYSADMIN: {
        clearance: CLEARANCE.L2,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.DIRECTORY, PERMISSIONS.TERMINAL, PERMISSIONS.INFRASTRUCTURE, PERMISSIONS.HISTORY, PERMISSIONS.MESSAGES],
        description: 'System Administrator'
    },
    HR_DIRECTOR: {
        clearance: CLEARANCE.L2,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.DIRECTORY, PERMISSIONS.DOCUMENTS, PERMISSIONS.MESSAGES, PERMISSIONS.HISTORY, PERMISSIONS.RESTRICTED],
        description: 'HR Director'
    },
    ENGINEER: {
        clearance: CLEARANCE.L1,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.MESSAGES, PERMISSIONS.INFRASTRUCTURE],
        description: 'Maintenance Engineer'
    },
    SCIENTIST: {
        clearance: CLEARANCE.L2,
        permissions: [PERMISSIONS.DASHBOARD, PERMISSIONS.MESSAGES],
        description: 'Research Scientist'
    },
    OVERSEER: {
        clearance: CLEARANCE.OMEGA,
        permissions: Object.values(PERMISSIONS), // All permissions
        description: 'System-level observer'
    }
};

/**
 * Check if role has permission
 */
export const roleHasPermission = (role, permission) => {
    const roleConfig = ROLES[role];
    if (!roleConfig) return false;
    return roleConfig.permissions.includes(permission);
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
    return ROLES[role]?.permissions || [];
};

/**
 * Get clearance for a role
 */
export const getRoleClearance = (role) => {
    return ROLES[role]?.clearance ?? CLEARANCE.EXTERNAL;
};
