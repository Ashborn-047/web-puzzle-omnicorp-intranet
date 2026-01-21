/**
 * Access Check Utility
 * 
 * Centralized permission and access verification.
 */

import { PERMISSIONS, roleHasPermission, getRoleClearance } from '../core/access/permissionMatrix.js';
import { hasMinimumClearance, RESOURCE_CLEARANCE } from '../core/access/clearanceLevels.js';

/**
 * Check if user can access a resource
 * @param {Object} user - User profile object
 * @param {string} resource - Resource identifier (e.g., 'terminal', 'documents')
 * @returns {{ allowed: boolean, reason?: string }}
 */
export const canAccess = (user, resource) => {
    if (!user) {
        return { allowed: false, reason: 'No user session' };
    }

    // Check explicit permissions first (from user profile)
    if (user.permissions && user.permissions.includes(resource)) {
        return { allowed: true };
    }

    // Check role-based permissions
    if (user.role && roleHasPermission(user.role, resource)) {
        return { allowed: true };
    }

    // Check clearance-based access
    const requiredClearance = RESOURCE_CLEARANCE[resource];
    if (requiredClearance !== undefined) {
        const userClearance = getRoleClearance(user.role);
        if (hasMinimumClearance(userClearance, requiredClearance)) {
            return { allowed: true };
        }
        return { allowed: false, reason: `Clearance Level ${requiredClearance} required` };
    }

    return { allowed: false, reason: 'Permission denied' };
};

/**
 * Check if user can view deleted messages
 * Only SYSADMIN and OVERSEER can see deleted content
 */
export const canViewDeleted = (user, originalUser = null) => {
    const checkUser = originalUser || user;
    if (!checkUser) return false;
    return ['SYSADMIN', 'OVERSEER'].includes(checkUser.role);
};

/**
 * Check if user can access the terminal
 */
export const canAccessTerminal = (user) => {
    return canAccess(user, PERMISSIONS.TERMINAL).allowed;
};

/**
 * Check if user can access restricted content
 */
export const canAccessRestricted = (user) => {
    return canAccess(user, PERMISSIONS.RESTRICTED).allowed;
};

/**
 * Get masked ID display based on user role
 */
export const getMaskedId = (authId, userRole) => {
    // External auditors can't see auth IDs
    if (userRole === 'AUDITOR_TEMP') {
        return 'ID: ****';
    }
    return `ID: ${authId}`;
};
