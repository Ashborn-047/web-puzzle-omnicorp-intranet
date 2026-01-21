/**
 * Behavior Flags
 * 
 * Tracks player behavior for:
 * - Password shift triggering
 * - Overseer message activation
 * - Ending classification
 */

/**
 * Create initial behavior flags
 */
export const createBehaviorFlags = () => ({
    profilesAccessed: [],       // Array of profile IDs accessed
    deletedMessagesRead: 0,     // Count of deleted messages viewed
    regionSwitches: 0,          // Count of region switches
    currentRegion: 'HQ',        // Current region
    terminalCommandsRun: [],    // Array of terminal commands used
    documentsViewed: [],        // Array of document IDs viewed
    failedLoginAttempts: 0,     // Failed password attempts
    auditCompleted: false,      // Whether fraud audit was completed
    restrictedAccessAttempts: 0, // Attempts to access restricted content
    sessionStartTime: Date.now()
});

/**
 * Record profile access
 */
export const recordProfileAccess = (flags, profileId) => {
    if (!flags.profilesAccessed.includes(profileId)) {
        return {
            ...flags,
            profilesAccessed: [...flags.profilesAccessed, profileId]
        };
    }
    return flags;
};

/**
 * Record deleted message read
 */
export const recordDeletedMessageRead = (flags) => {
    return {
        ...flags,
        deletedMessagesRead: flags.deletedMessagesRead + 1
    };
};

/**
 * Record region switch
 */
export const recordRegionSwitch = (flags, newRegion) => {
    if (flags.currentRegion !== newRegion) {
        return {
            ...flags,
            regionSwitches: flags.regionSwitches + 1,
            currentRegion: newRegion
        };
    }
    return flags;
};

/**
 * Record terminal command
 */
export const recordTerminalCommand = (flags, command) => {
    return {
        ...flags,
        terminalCommandsRun: [...flags.terminalCommandsRun, { command, timestamp: Date.now() }]
    };
};

/**
 * Record document viewed
 */
export const recordDocumentViewed = (flags, documentId) => {
    if (!flags.documentsViewed.includes(documentId)) {
        return {
            ...flags,
            documentsViewed: [...flags.documentsViewed, documentId]
        };
    }
    return flags;
};

/**
 * Record failed login
 */
export const recordFailedLogin = (flags) => {
    return {
        ...flags,
        failedLoginAttempts: flags.failedLoginAttempts + 1
    };
};

/**
 * Record audit completion
 */
export const recordAuditCompleted = (flags) => {
    return {
        ...flags,
        auditCompleted: true
    };
};

/**
 * Record restricted access attempt
 */
export const recordRestrictedAccessAttempt = (flags) => {
    return {
        ...flags,
        restrictedAccessAttempts: flags.restrictedAccessAttempts + 1
    };
};

/**
 * Get behavior summary for Overseer analysis
 */
export const getBehaviorSummary = (flags) => {
    return {
        profileCount: flags.profilesAccessed.length,
        deletedMessagesRead: flags.deletedMessagesRead,
        regionSwitches: flags.regionSwitches,
        commandCount: flags.terminalCommandsRun.length,
        documentsViewed: flags.documentsViewed.length,
        auditCompleted: flags.auditCompleted,
        sessionDuration: Date.now() - flags.sessionStartTime
    };
};
