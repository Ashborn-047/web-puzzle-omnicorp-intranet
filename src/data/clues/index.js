/**
 * Clue Solutions
 * 
 * @description The three primary synchronization keys.
 * 
 * ALPHA (History): Found in corporate timeline - Impact Year
 * BETA (Human): Found in HR records - Subject 882 ID
 * GAMMA (System): Found in infrastructure - Failing Node ID
 */

export const SOLUTIONS = {
    ALPHA: "1980",      // Impact Year - found in History timeline
    BETA: "882",        // Subject ID - found in HR Director messages
    GAMMA: "NODE-666"   // Failing Node - found in Infrastructure view
};

/**
 * Clue hints (for Phase 7 expansion)
 */
export const CLUE_HINTS = {
    ALPHA: {
        description: "Impact Year",
        location: "Corporate History timeline",
        hint: "The year of the Nevada desert impact"
    },
    BETA: {
        description: "Subject ID",
        location: "HR Director messages",
        hint: "Subject 882 - do not write this down"
    },
    GAMMA: {
        description: "Failing Node",
        location: "Infrastructure diagnostics",
        hint: "Temperature > 600°C, Sector 7"
    }
};

/**
 * Validate a solution attempt
 */
export const validateSolution = (key, attempt) => {
    const solution = SOLUTIONS[key.toUpperCase()];
    if (!solution) return false;
    return attempt.toUpperCase().trim() === solution.toUpperCase();
};

/**
 * Validate all three keys
 */
export const validateAllKeys = (alpha, beta, gamma) => {
    return (
        alpha.trim() === SOLUTIONS.ALPHA &&
        beta.trim() === SOLUTIONS.BETA &&
        gamma.toUpperCase().trim() === SOLUTIONS.GAMMA
    );
};
