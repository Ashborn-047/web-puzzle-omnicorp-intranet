/**
 * Dynamic Messages
 * 
 * Messages that are triggered by player behavior.
 * Each message has a trigger condition and can only be shown once.
 */

export const DYNAMIC_MESSAGES = {
    // Finance tab reminder
    FINANCE_AUDIT_HINT: {
        id: 'finance_audit_hint',
        from: 'Sarah Kone',
        title: 'Audit Reminder',
        body: 'Remember: Flag transactions that look like they are splitting a large payment into smaller chunks.',
        trigger: {
            tab: 'finance',
            role: 'AUDITOR_TEMP',
            delay: 1500
        }
    },

    // Infrastructure hint (for later expansion)
    INFRA_NODE_WARNING: {
        id: 'infra_node_warning',
        from: 'System',
        title: 'Infrastructure Alert',
        body: 'Node 666 temperature readings are outside acceptable parameters.',
        trigger: {
            tab: 'infrastructure',
            delay: 2000
        }
    },

    // Terminal first use (for later expansion)
    TERMINAL_WELCOME: {
        id: 'terminal_welcome',
        from: 'System',
        title: 'Secure Shell Active',
        body: 'Terminal access granted. Type "help" for available commands.',
        trigger: {
            tab: 'terminal',
            delay: 500
        }
    }
};

/**
 * Get message by ID
 */
export const getDynamicMessage = (messageId) => {
    return Object.values(DYNAMIC_MESSAGES).find(m => m.id === messageId) || null;
};

/**
 * Get all trigger-ready messages for a tab
 */
export const getMessagesForTab = (tab, role = null) => {
    return Object.values(DYNAMIC_MESSAGES).filter(m => {
        if (m.trigger.tab !== tab) return false;
        if (m.trigger.role && m.trigger.role !== role) return false;
        return true;
    });
};

export default DYNAMIC_MESSAGES;
