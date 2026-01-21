/**
 * HQ Region Configuration
 * 
 * HQ is the corporate headquarters:
 * - Clean, sanitized environment
 * - Highly procedural
 * - Polite, formal language
 * - Heavy redaction of sensitive content
 */

export const HQ_REGION = {
    id: 'HQ',
    name: 'Headquarters',
    tone: 'CORPORATE_FORMAL',
    redactionLevel: 'HEAVY',
    characteristics: [
        'Clean',
        'Sanitized',
        'Highly procedural',
        'Polite language',
        'Heavy redaction'
    ],

    // Language style for this region
    languageStyle: {
        greetings: ['Good morning', 'Thank you for your inquiry', 'Per your request'],
        closings: ['Best regards', 'Respectfully', 'Thank you for your patience'],
        errorMessages: [
            'This request requires additional authorization.',
            'Please contact your supervisor for access.',
            'Access level insufficient for this resource.'
        ]
    },

    // Redaction rules
    redactionRules: {
        percentToRedact: 0.3,
        alwaysRedact: ['Project Omega', 'Subject 882', 'Sector 7', 'Node-666'],
        neverRedact: ['policy', 'procedure', 'compliance']
    },

    // Visual theme
    theme: {
        primary: 'blue-900',
        background: 'gray-50',
        accent: 'blue-600',
        mood: 'professional'
    }
};

export default HQ_REGION;
