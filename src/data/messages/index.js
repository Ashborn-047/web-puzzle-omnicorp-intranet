/**
 * Messages Index
 * 
 * @description Central registry of all message content.
 * Phase 2 will populate with extracted data from CorporatePortal.jsx
 */

// Placeholder exports - Phase 2 will populate
export const systemMessages = [];
export const auditMessages = [];
export const hrMessages = [];
export const itMessages = [];
export const sector7Messages = [];

export const getAllMessages = () => ({
    system: systemMessages,
    audit: auditMessages,
    hr: hrMessages,
    it: itMessages,
    sector7: sector7Messages
});
