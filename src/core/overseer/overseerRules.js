/**
 * Overseer Rules
 * 
 * The Overseer is NOT a character. It is:
 * - A system-level observer
 * - A classification engine
 * - A narrative pressure
 * 
 * Rules:
 * - Never explains
 * - Never threatens
 * - Never speaks more than 1 line
 * - Never appears early
 * - Maximum 3 messages per playthrough
 */

export const OVERSEER_CONFIG = {
    maxMessagesPerPlaythrough: 3,
    minProfilesBeforeActive: 5,
    minSessionTimeMs: 60000,  // 1 minute before first message
    messageCooldownMs: 120000  // 2 minutes between messages
};

/**
 * Overseer message templates
 * One line only. Observational. Never explains.
 */
export const OVERSEER_MESSAGES = {
    VARIANCE: [
        "Behavioral variance logged.",
        "Deviation recorded.",
        "Pattern interrupted."
    ],
    CORRELATION: [
        "Correlation detected.",
        "Connection established.",
        "Data points aligned."
    ],
    PATTERN: [
        "Access pattern consistent.",
        "Behavior within parameters.",
        "Classification proceeding."
    ],
    OBSERVATION: [
        "Observation recorded.",
        "Subject noted.",
        "Activity logged."
    ],
    FINAL: [
        "Classification complete.",
        "Assessment finalized.",
        "Subject catalogued."
    ]
};

/**
 * Get random message from category
 */
export const getOverseerMessage = (category) => {
    const messages = OVERSEER_MESSAGES[category] || OVERSEER_MESSAGES.OBSERVATION;
    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Check if Overseer should be active based on behavior
 */
export const isOverseerActive = (behaviorFlags, progressionState) => {
    // Not active if max messages reached
    if (progressionState.overseerMessagesShown >= OVERSEER_CONFIG.maxMessagesPerPlaythrough) {
        return false;
    }

    // Not active until minimum profiles accessed
    if (behaviorFlags.profilesAccessed.length < OVERSEER_CONFIG.minProfilesBeforeActive) {
        return false;
    }

    // Not active until minimum session time
    const sessionTime = Date.now() - behaviorFlags.sessionStartTime;
    if (sessionTime < OVERSEER_CONFIG.minSessionTimeMs) {
        return false;
    }

    return true;
};

/**
 * Check cooldown between messages
 */
export const canShowOverseerMessage = (progressionState) => {
    if (progressionState.overseerMessageQueue.length === 0) {
        return true;
    }

    const lastMessage = progressionState.overseerMessageQueue[progressionState.overseerMessageQueue.length - 1];
    const timeSinceLastMessage = Date.now() - lastMessage.timestamp;

    return timeSinceLastMessage >= OVERSEER_CONFIG.messageCooldownMs;
};
