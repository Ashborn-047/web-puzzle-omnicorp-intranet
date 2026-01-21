/**
 * Data Layer Index
 * 
 * @description Central export for all game data.
 * Phase 4 will update CorporatePortal.jsx to import from here.
 */

// Profiles and USER_DB
export * from './profiles/index.js';
export { DIRECTORY_EMPLOYEES, DIRECTORY_FILTERS, filterEmployees } from './profiles/directory.js';

// Documents and Ledger
export * from './documents/index.js';

// Clues and Solutions
export * from './clues/index.js';

// Messages (placeholder - currently embedded in profiles)
export * from './messages/index.js';
