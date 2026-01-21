/**
 * Sector 7 Configuration
 * 
 * Sector 7 is the research/containment zone:
 * - Technical, emotionless
 * - Abnormal metrics
 * - References to impossible constants
 * - Minimal redaction, maximum ambiguity
 */

export const SECTOR_7 = {
    id: 'SECTOR_7',
    name: 'Sector 7',
    tone: 'TECHNICAL_DETACHED',
    redactionLevel: 'MINIMAL',
    characteristics: [
        'Technical',
        'Emotionless',
        'Abnormal metrics',
        'References to impossible constants',
        'Minimal redaction',
        'Maximum ambiguity'
    ],

    // Language style - clinical, detached
    languageStyle: {
        greetings: ['NOTICE:', 'ALERT:', 'LOG ENTRY:'],
        closings: ['End of record.', '[AUTOMATED]', 'Timestamp verified.'],
        errorMessages: [
            'Anomaly detected. Containment stable.',
            'Metric outside expected parameters.',
            'Reference value undefined. Proceeding.'
        ]
    },

    // Redaction rules - minimal but strategic
    redactionRules: {
        percentToRedact: 0.05,
        alwaysRedact: [], // They don't hide things here
        neverRedact: ['Subject 882', 'Node-666'], // These appear openly
        useAmbiguity: true // Instead of redacting, use vague language
    },

    // Visual theme - dark, technical
    theme: {
        primary: 'green-500',
        background: 'slate-900',
        accent: 'red-500',
        mood: 'ominous'
    },

    // Anomalies unique to Sector 7
    anomalies: {
        impossibleTemperatures: true,  // Temps > physically possible
        timeDiscrepancies: true,       // Logs from future dates
        selfReferentialDocs: true      // Documents that reference themselves
    }
};

export default SECTOR_7;
