/**
 * Overseer Triggers
 * 
 * Behavioral conditions that trigger Overseer messages.
 * The Overseer responds to patterns, not intent.
 */

import { getOverseerMessage, isOverseerActive, canShowOverseerMessage } from './overseerRules.js';

/**
 * Trigger types
 */
export const TRIGGER_TYPES = {
    VARIANCE: 'VARIANCE',       // Unexpected behavior detected
    CORRELATION: 'CORRELATION', // Player connecting disparate information  
    PATTERN: 'PATTERN',         // Consistent behavior confirmed
    OBSERVATION: 'OBSERVATION', // General observation
    FINAL: 'FINAL'              // End-game classification
};

/**
 * Trigger conditions
 */
const TRIGGER_CONDITIONS = {
    // Variance: Player does something unexpected
    VARIANCE: (behavior, prev) => {
        // Sudden spike in activity
        if (behavior.profilesAccessed.length - (prev?.profilesAccessed?.length || 0) >= 3) {
            return true;
        }
        // Multiple restricted access attempts
        if (behavior.restrictedAccessAttempts >= 3) {
            return true;
        }
        return false;
    },

    // Correlation: Player connects information
    CORRELATION: (behavior) => {
        // Accessed profiles from different departments
        // This would check profile regions/departments
        if (behavior.profilesAccessed.length >= 4 && behavior.documentsViewed.length >= 2) {
            return true;
        }
        return false;
    },

    // Pattern: Consistent behavior
    PATTERN: (behavior) => {
        // Regular terminal usage
        if (behavior.terminalCommandsRun.length >= 5) {
            return true;
        }
        // Systematic document review
        if (behavior.documentsViewed.length >= 3) {
            return true;
        }
        return false;
    }
};

/**
 * Check for Overseer trigger
 * @returns {{ shouldTrigger: boolean, type?: string, message?: string }}
 */
export const checkOverseerTrigger = (behaviorFlags, progressionState, previousBehavior = null) => {
    // Check if Overseer is active
    if (!isOverseerActive(behaviorFlags, progressionState)) {
        return { shouldTrigger: false };
    }

    // Check cooldown
    if (!canShowOverseerMessage(progressionState)) {
        return { shouldTrigger: false };
    }

    // Check each trigger condition
    for (const [type, condition] of Object.entries(TRIGGER_CONDITIONS)) {
        if (condition(behaviorFlags, previousBehavior)) {
            return {
                shouldTrigger: true,
                type,
                message: getOverseerMessage(type)
            };
        }
    }

    return { shouldTrigger: false };
};

/**
 * Get final Overseer message for ending
 */
export const getFinalOverseerMessage = (endingType) => {
    const messages = {
        COMPLIANT: "Subject classification: Compliant. Optimal outcome.",
        DEFIANT: "Subject classification: Defiant. Predicted variance.",
        MORAL: "Subject classification: Moral. Irrelevant metric.",
        OBSERVANT: "Subject classification: Observant. Noteworthy."
    };
    return messages[endingType] || getOverseerMessage('FINAL');
};
