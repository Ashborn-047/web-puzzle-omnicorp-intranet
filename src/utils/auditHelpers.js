/**
 * Audit Helpers Utility
 * 
 * Logic for the financial audit puzzle.
 */

import { FRAUD_VENDOR } from '../data/documents/ledger.js';

/**
 * Approval threshold - amounts >= this require executive approval
 */
export const APPROVAL_THRESHOLD = 5000;

/**
 * Check if a transaction is suspicious (structuring pattern)
 * Structuring = keeping transactions just under the threshold
 */
export const isSuspiciousTransaction = (transaction, threshold = APPROVAL_THRESHOLD) => {
    // Suspicious if it's from the fraud vendor and just under threshold
    if (transaction.vendor === FRAUD_VENDOR && transaction.cost < threshold) {
        return true;
    }
    // Also flag if it's very close to threshold (90-99%)
    if (transaction.cost >= threshold * 0.9 && transaction.cost < threshold) {
        return true;
    }
    return false;
};

/**
 * Detect structuring pattern (multiple transactions just under threshold)
 * @returns {Array} - Array of suspicious transaction IDs
 */
export const detectStructuringPattern = (transactions, vendor = FRAUD_VENDOR, threshold = APPROVAL_THRESHOLD) => {
    const suspicious = transactions.filter(t =>
        t.vendor === vendor && t.cost < threshold
    );

    // Pattern is confirmed if there are 2+ transactions
    if (suspicious.length >= 2) {
        return suspicious.map(t => t.id);
    }
    return [];
};

/**
 * Validate audit submission
 * @returns {{ success: boolean, message: string, suspectId?: string }}
 */
export const validateAuditSubmission = (selectedIds, allTransactions, userLevel = 0) => {
    const fraudulentIds = detectStructuringPattern(allTransactions, FRAUD_VENDOR);

    // Check if all fraudulent transactions were flagged
    const caughtAll = fraudulentIds.every(id => selectedIds.includes(id));

    // Check for false positives
    const noFalsePositives = selectedIds.every(id => fraudulentIds.includes(id));

    if (caughtAll && noFalsePositives) {
        // Find the authorizing ID
        const fraudTx = allTransactions.find(t => t.vendor === FRAUD_VENDOR);
        const canSeeSuspect = userLevel >= 2; // Requires L2 (Sarah Kone) or higher

        return {
            success: true,
            message: `Pattern Identified: Structuring confirmed. ${fraudulentIds.length} payments < $${APPROVAL_THRESHOLD} to '${FRAUD_VENDOR}' authorized by ${canSeeSuspect ? `ID ${fraudTx?.auth}` : '[REDACTED - L2 CLEARANCE REQUIRED]'}.`,
            suspectId: canSeeSuspect ? fraudTx?.auth : 'REDACTED',
            suspectName: canSeeSuspect ? 'David Bowman' : 'REDACTED'
        };
    }

    if (!caughtAll && selectedIds.length > 0) {
        return {
            success: false,
            message: 'Audit incomplete. Some fraudulent transactions were not flagged.'
        };
    }

    if (!noFalsePositives) {
        return {
            success: false,
            message: 'Audit rejected. Legitimate transactions were incorrectly flagged.'
        };
    }

    return {
        success: false,
        message: 'Audit Rejected. You either missed fraudulent transactions or flagged legitimate ones. Review the Policy.'
    };
};

/**
 * Get audit instructions based on policies
 */
export const getAuditInstructions = () => [
    `Policy 1: Expenses over $${APPROVAL_THRESHOLD.toLocaleString()} require Executive (L1) approval.`,
    'Policy 2: Sector 7 transactions are currently frozen.',
    'Task: Select any transactions that violate these policies to flag them.'
];
