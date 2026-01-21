/**
 * Financial Ledger Data
 * 
 * @description Procurement and travel expense data for the audit puzzle.
 * Contains the fraud pattern: multiple transactions < $5000 to "Apex Sol."
 */

export const CURRENT_YEAR = 2026;
export const FRAUD_VENDOR = "Apex Sol.";

/**
 * Ledger transactions
 * 
 * Fraud pattern: Transactions P-1043, P-1045, P-1047 are all < $5000
 * to "Apex Sol." authorized by ID 9000 (SysAdmin David Bowman).
 */
export const LEDGER_DATA = [
    // Procurement
    { id: 'P-1042', date: '2026-05-10', cat: 'Hardware', desc: 'Monitor Stand x5', vendor: 'OfficeDepot', cost: 250.00, auth: '7331', role: 'LEAD' },
    { id: 'P-1043', date: '2026-05-10', cat: 'Services', desc: 'Consulting: Net Arch', vendor: FRAUD_VENDOR, cost: 4950.00, auth: '9000', role: 'ADMIN' },
    { id: 'P-1044', date: '2026-05-11', cat: 'Software', desc: 'JIRA License Renewal', vendor: 'Atlassian', cost: 1200.00, auth: '9000', role: 'ADMIN' },
    { id: 'P-1045', date: '2026-05-11', cat: 'Services', desc: 'Logistics Analysis', vendor: FRAUD_VENDOR, cost: 4890.00, auth: '9000', role: 'ADMIN' },
    { id: 'P-1046', date: '2026-05-12', cat: 'Pantry', desc: 'Coffee/Creamer', vendor: 'Sysco', cost: 45.50, auth: '0000', role: 'INT' },
    { id: 'P-1047', date: '2026-05-12', cat: 'Services', desc: 'Data Optimization', vendor: FRAUD_VENDOR, cost: 4999.00, auth: '9000', role: 'ADMIN' },
    { id: 'P-1048', date: '2026-05-12', cat: 'Hardware', desc: 'Mouse/Keyboard', vendor: 'Logitech', cost: 120.00, auth: '0451', role: 'MGR' },

    // Travel
    { id: 'T-2201', date: '2026-05-01', cat: 'Flight', desc: 'Sales Conf - NY', vendor: 'Delta', cost: 450.00, auth: '7331', role: 'LEAD' },
    { id: 'T-2202', date: '2026-05-02', cat: 'Hotel', desc: 'Marriott Stay', vendor: 'Marriott', cost: 800.00, auth: '7331', role: 'LEAD' },
    { id: 'T-2203', date: '2026-05-05', cat: 'Meal', desc: 'Client Dinner', vendor: 'Dorsia', cost: 350.00, auth: '7331', role: 'LEAD' },
];

/**
 * Get fraudulent transaction IDs
 */
export const getFraudulentTransactionIds = () => {
    return LEDGER_DATA.filter(t => t.vendor === FRAUD_VENDOR).map(t => t.id);
};

/**
 * Get transactions by category (procurement vs travel)
 */
export const getTransactionsByType = (type) => {
    const prefix = type === 'procurement' ? 'P' : 'T';
    return LEDGER_DATA.filter(t => t.id.startsWith(prefix));
};
