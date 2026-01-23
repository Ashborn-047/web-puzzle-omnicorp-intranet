/**
 * Audit Helpers Utility (FINAL REVISION)
 * 
 * Logic for the financial process-based audit puzzle.
 * Detects bypass terms: "Auto-Authorized", "Expedited", "System Override".
 */

export const BYPASS_TERMS = ['Auto-Authorized', 'Expedited', 'System Override'];

/**
 * Identify all process anomalies in a transaction set
 */
export const isAnomaly = (t) => {
    return BYPASS_TERMS.includes(t.requestedBy) || BYPASS_TERMS.includes(t.verifiedBy);
};

/**
 * Validate audit submission based on process anomalies
 */
export const validateProcessAudit = (selectedIds, allTransactions, activeCategories) => {
    // 1. Get anomalies within the active category set
    const relevantAnomalies = allTransactions.filter(t =>
        activeCategories.includes(t.category) && isAnomaly(t)
    );

    const anomalyIds = relevantAnomalies.map(t => t.transactionId);

    // 2. Check if player caught ALL and ONLY these anomalies
    const caughtAll = anomalyIds.every(id => selectedIds.includes(id));
    const onlyAnomalies = selectedIds.every(id => anomalyIds.includes(id));

    if (caughtAll && onlyAnomalies && selectedIds.length > 0) {
        // 3. Confirm consistent authorization source (Puzzle requirement)
        const sources = [...new Set(relevantAnomalies.map(t => t.authorizedBy))];
        if (sources.length === 1) {
            return {
                success: true,
                message: "Review complete. A recurring authorization pattern was identified. Multiple entries bypassed standard request and verification steps. Authorization source is restricted under current clearance."
            };
        }
    }

    return {
        success: false,
        message: "Submission incomplete. Selected items do not demonstrate a consistent policy violation pattern."
    };
};

/**
 * Validate audit submission for Act II (Systemic anomalies)
 */
export const validateSystemAudit = (selectedIds, allTransactions, activeCategories) => {
    // 1. Get system-authorized items within categories
    const systemItems = allTransactions.filter(t =>
        activeCategories.includes(t.category) &&
        (t.authorizedBy === 'ID-9000' || t.authSource === 'SYS-9000')
    );

    const systemIds = systemItems.map(t => t.transactionId);

    // 2. Check if player caught ALL system items
    const caughtAll = systemIds.every(id => selectedIds.includes(id));
    const onlySystem = selectedIds.every(id => systemIds.includes(id));

    if (caughtAll && onlySystem && selectedIds.length > 0) {
        return {
            success: true,
            message: "Cross-departmental variance accepted. Data suggests systemic exception handling rather than human error."
        };
    }

    return {
        success: false,
        message: "Submission rejected. Individual items flagged do not present a systemic pattern."
    };
};
