/**
 * Profiles Index
 * 
 * @description Central registry of all employee profiles.
 * Builds USER_DB object from individual profile files.
 */

// External profiles
import { tempAuditor } from './external/tempAuditor.js';

// Audit department
import { chiefAuditor } from './audit/chiefAuditor.js';

// IT department
import { sysAdmin, engineer } from './it/sysAdmin.js';

// HR department
import { hrDirector } from './hr/hrDirector.js';

// Sector 7
import { rndLead, overseer } from './sector7/rndLead.js';

/**
 * All profiles indexed by ID
 * This replaces the inline USER_DB in CorporatePortal.jsx
 */
export const USER_DB = {
    [tempAuditor.id]: tempAuditor,
    [chiefAuditor.id]: chiefAuditor,
    [sysAdmin.id]: sysAdmin,
    [engineer.id]: engineer,
    [hrDirector.id]: hrDirector,
    [rndLead.id]: rndLead,
    [overseer.id]: overseer
};

/**
 * Get profile by ID
 */
export const getProfile = (id) => USER_DB[id] || null;

/**
 * Get all profile IDs
 */
export const getAllProfileIds = () => Object.keys(USER_DB);

// Re-export individual profiles for direct access
export {
    tempAuditor,
    chiefAuditor,
    sysAdmin,
    engineer,
    hrDirector,
    rndLead,
    overseer
};
