/**
 * Progression State
 * 
 * Tracks game progression and ending classification.
 * All endings confirm the system anticipated this path.
 */

import { PASSWORD_MODE } from '../access/passwordRules.js';

/**
 * Ending classifications
 * Player is classified based on behavior, not judged.
 */
export const ENDINGS = {
    COMPLIANT: 'COMPLIANT',     // Followed procedures, minimal deviation
    DEFIANT: 'DEFIANT',         // Attempted to break rules, accessed restricted
    MORAL: 'MORAL',             // Showed concern for employees
    OBSERVANT: 'OBSERVANT'      // Noticed and documented anomalies
};

/**
 * Create initial progression state
 */
export const createProgressionState = () => ({
    loginMode: PASSWORD_MODE.ID_ONLY,
    passwordShiftTriggered: false,
    cluesFound: {
        alpha: false,   // History clue (1980)
        beta: false,    // Human clue (882)
        gamma: false    // System clue (NODE-666)
    },
    overseerMessagesShown: 0,
    overseerMessageQueue: [],
    endingClassification: null,
    projectOmegaUnlocked: false,
    gameEnded: false,
    userClearance: 'AUDIT_L1'
});

/**
 * Record clue found
 */
export const recordClueFound = (state, clueType) => {
    return {
        ...state,
        cluesFound: {
            ...state.cluesFound,
            [clueType.toLowerCase()]: true
        }
    };
};

/**
 * Trigger password shift
 */
export const triggerPasswordShift = (state) => {
    if (state.passwordShiftTriggered) return state;
    return {
        ...state,
        loginMode: PASSWORD_MODE.FULL_CREDENTIALS,
        passwordShiftTriggered: true
    };
};

/**
 * Record Overseer message shown
 */
export const recordOverseerMessage = (state, message) => {
    return {
        ...state,
        overseerMessagesShown: state.overseerMessagesShown + 1,
        overseerMessageQueue: [...state.overseerMessageQueue, { message, timestamp: Date.now() }]
    };
};

/**
 * Classify ending based on behavior
 */
export const classifyEnding = (behaviorFlags, progressionState) => {
    const { profilesAccessed, deletedMessagesRead, restrictedAccessAttempts, auditCompleted } = behaviorFlags;

    // Observant: Accessed many profiles, read deleted messages, found clues
    const cluesFoundCount = Object.values(progressionState.cluesFound).filter(Boolean).length;
    if (cluesFoundCount >= 2 && deletedMessagesRead >= 2 && profilesAccessed.length >= 4) {
        return ENDINGS.OBSERVANT;
    }

    // Defiant: Tried to access restricted content, many failed logins
    if (restrictedAccessAttempts >= 3 || behaviorFlags.failedLoginAttempts >= 5) {
        return ENDINGS.DEFIANT;
    }

    // Moral: Read deleted messages about employees, minimal restricted access
    if (deletedMessagesRead >= 1 && restrictedAccessAttempts < 2) {
        return ENDINGS.MORAL;
    }

    // Compliant: Completed audit, followed procedures
    if (auditCompleted && profilesAccessed.length <= 3) {
        return ENDINGS.COMPLIANT;
    }

    // Default to Compliant
    return ENDINGS.COMPLIANT;
};

/**
 * Check if all clues are found
 */
export const allCluesFound = (state) => {
    return state.cluesFound.alpha && state.cluesFound.beta && state.cluesFound.gamma;
};

/**
 * Unlock Project Omega
 */
export const unlockProjectOmega = (state) => {
    return {
        ...state,
        projectOmegaUnlocked: true
    };
};

/**
 * End the game
 */
export const endGame = (state, behaviorFlags) => {
    return {
        ...state,
        gameEnded: true,
        endingClassification: classifyEnding(behaviorFlags, state)
    };
};
