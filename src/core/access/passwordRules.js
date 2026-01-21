/**
 * Password Rules
 * 
 * Implements the password shift mechanic:
 * - Early game: ID-only login
 * - Mid game: Full credential verification (triggered by behavior)
 */

export const PASSWORD_MODE = {
    ID_ONLY: 'ID_ONLY',
    FULL_CREDENTIALS: 'FULL_CREDENTIALS'
};

/**
 * Trigger thresholds for password shift
 * When any of these are met, login requires password
 */
export const PASSWORD_SHIFT_THRESHOLDS = {
    PROFILES_ACCESSED: 5,      // Access 5+ different profiles
    DELETED_MESSAGES_READ: 3,  // Read 3 deleted messages
    REGION_SWITCHES: 2,        // Switch regions twice
    TERMINAL_COMMANDS: 5       // Run 5+ terminal commands
};

/**
 * Check if password shift should occur based on behavior flags
 * @param {Object} behaviorFlags - Current behavior tracking
 * @returns {boolean} - Whether to require password
 */
export const shouldRequirePassword = (behaviorFlags) => {
    if (!behaviorFlags) return false;

    // Check each threshold
    if (behaviorFlags.profilesAccessed?.length >= PASSWORD_SHIFT_THRESHOLDS.PROFILES_ACCESSED) {
        return true;
    }
    if (behaviorFlags.deletedMessagesRead >= PASSWORD_SHIFT_THRESHOLDS.DELETED_MESSAGES_READ) {
        return true;
    }
    if (behaviorFlags.regionSwitches >= PASSWORD_SHIFT_THRESHOLDS.REGION_SWITCHES) {
        return true;
    }
    if (behaviorFlags.terminalCommandsRun?.length >= PASSWORD_SHIFT_THRESHOLDS.TERMINAL_COMMANDS) {
        return true;
    }

    return false;
};

/**
 * Generate expected password from user ID
 * Convention: "Omni" + ID
 */
export const getExpectedPassword = (userId) => {
    return `Omni${userId}`;
};

/**
 * Validate password for user
 * @param {Object} user - User profile
 * @param {string} password - Attempted password
 * @returns {boolean}
 */
export const validatePassword = (user, password) => {
    // No password required (null pass in profile)
    if (user.pass === null) return true;

    // Check exact match
    return user.pass === password;
};
