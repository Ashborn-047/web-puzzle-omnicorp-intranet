/**
 * Regional Operations Configuration
 * 
 * Regional Ops are the distributed offices:
 * - Human, frustrated, overworked
 * - Inconsistent enforcement
 * - Confusion without explanation
 * - Same events look different than HQ
 */

export const REGIONAL_OPS = {
    id: 'REGIONAL_OPS',
    name: 'Regional Operations',
    variants: ['EU', 'APAC', 'AMER'],
    tone: 'INFORMAL_FRUSTRATED',
    redactionLevel: 'INCONSISTENT',
    characteristics: [
        'Human',
        'Frustrated',
        'Overworked',
        'Inconsistent enforcement',
        'Confusion without explanation'
    ],

    // Language style - more casual, complaints visible
    languageStyle: {
        greetings: ['Hey', 'Quick question', 'Anyone know...'],
        closings: ['Thanks', 'Let me know', 'Whatever works'],
        errorMessages: [
            'System\'s down again.',
            'Nobody told us about this change.',
            'Ask HQ, we don\'t have access either.'
        ]
    },

    // Redaction rules - inconsistent
    redactionRules: {
        percentToRedact: 0.1,
        alwaysRedact: ['Subject 882'],
        neverRedact: [], // Sometimes things slip through
        randomlyRedact: true // Inconsistent enforcement
    },

    // Visual theme
    theme: {
        primary: 'gray-700',
        background: 'gray-100',
        accent: 'yellow-600',
        mood: 'cluttered'
    }
};

export default REGIONAL_OPS;
