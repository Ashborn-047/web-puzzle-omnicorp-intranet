/**
 * Text Redaction Utility
 * 
 * Applies region-specific redaction to sensitive content.
 */

import { getClearanceLevel, CLEARANCE } from '../core/access/clearanceLevels.js';

/**
 * Redaction styles by region
 */
const REDACTION_STYLES = {
    HQ: {
        char: '█',
        style: 'solid',
        percentToRedact: 0.3
    },
    REGIONAL_OPS: {
        char: '░',
        style: 'partial',
        percentToRedact: 0.1,
        inconsistent: true
    },
    SECTOR_7: {
        char: '▓',
        style: 'minimal',
        percentToRedact: 0.05,
        useAmbiguity: true
    }
};

/**
 * Words that should always be redacted at lower clearances
 */
const SENSITIVE_WORDS = [
    'Project Omega', 'Subject 882', 'Node-666',
    'biomass', 'containment', 'purge'
];

/**
 * Create a redaction block
 */
export const createRedactionBlock = (length = 10, region = 'HQ') => {
    const style = REDACTION_STYLES[region] || REDACTION_STYLES.HQ;
    return style.char.repeat(length);
};

/**
 * Apply redaction based on clearance and region
 */
export const redactText = (text, userClearance = 'EXTERNAL', region = 'HQ') => {
    if (!text) return text;

    const clearanceLevel = typeof userClearance === 'string'
        ? getClearanceLevel(userClearance)
        : userClearance;

    // OMEGA clearance sees everything
    if (clearanceLevel >= CLEARANCE.OMEGA) {
        return text;
    }

    const style = REDACTION_STYLES[region] || REDACTION_STYLES.HQ;
    let result = text;

    // Redact sensitive words for lower clearances
    if (clearanceLevel < CLEARANCE.L2) {
        SENSITIVE_WORDS.forEach(word => {
            const regex = new RegExp(word, 'gi');
            if (style.useAmbiguity) {
                // Sector 7 uses ambiguous replacements
                result = result.replace(regex, '[REFERENCE UNDEFINED]');
            } else {
                result = result.replace(regex, createRedactionBlock(word.length, region));
            }
        });
    }

    // Inconsistent redaction for Regional Ops
    if (style.inconsistent && Math.random() < 0.3) {
        // Sometimes things slip through
        return text;
    }

    return result;
};

/**
 * Check if content should be hidden entirely
 */
export const shouldHideContent = (contentClearance, userClearance) => {
    const required = typeof contentClearance === 'string'
        ? getClearanceLevel(contentClearance)
        : contentClearance;
    const user = typeof userClearance === 'string'
        ? getClearanceLevel(userClearance)
        : userClearance;

    return user < required;
};

/**
 * Get redacted preview of text
 */
export const getRedactedPreview = (text, maxLength = 50, clearance = 'EXTERNAL') => {
    const redacted = redactText(text, clearance);
    if (redacted.length <= maxLength) return redacted;
    return redacted.substring(0, maxLength) + '...';
};
