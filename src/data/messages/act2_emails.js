/**
 * Act II Emails - STRICT CANON REWORK
 * 
 * Rules:
 * - Neutral corporate tone.
 * - Dry, procedural, contradictory.
 * - No forbidden words (omega, experiment, etc.).
 * - Justification for L1 figures (Venn, Solanki, Reed, Kovács).
 * - System ID (4112) hidden in patterns.
 */

export const ACT2_EMAILS = [
    // 1-10: Baseline Normalcy & Start of Patterns (Harold Venn / Procurement)
    { id: 'e_a2_01', from: 'System Admin', subject: 'Node-06 Sync Status', date: '2026-04-01', body: 'Sync successful. Variance: 0.01%.' },
    { id: 'e_a2_02', from: 'Procurement-NA', subject: 'Inbound #P-9002 Confirm', date: '2026-04-02', body: 'Weight manifest: 500kg. Auth: Harold Venn.' },
    { id: 'e_a2_03', from: 'Facilities-NA', subject: 'Zoning: Sector 7', date: '2026-04-02', body: 'Parcel 882 classification updated to "Buffer". Lead: Thomas Reed.' },
    { id: 'e_a2_04', from: 'System Admin', subject: 'Weekly Log #4112', date: '2026-04-03', body: 'Log #4112 generated. All L1 access verified.' },
    { id: 'e_a2_05', from: 'P. Aris', subject: 'Re: Shipment P-9002', date: '2026-04-04', body: 'Manifest says 500kg. Scaling at 518kg. Venn approved the delta.' },
    { id: 'e_a2_06', from: 'H. Venn', subject: 'Procedural Variance', date: '2026-04-04', body: 'Weight deltas in Sector 7 are within tolerance 112. No remediation required.' },
    { id: 'e_a2_07', from: 'Procurement-NA', subject: 'Biomass Order #P-9003', date: '2026-04-05', body: 'Order confirmed: 800kg. Sign: 3124.' },
    { id: 'e_a2_08', from: 'Legal', subject: 'Sector 7 NDA Reminder', date: '2026-04-06', body: 'Internal procedures regarding "Removal" status are strictly confidential.' },
    { id: 'e_a2_09', from: 'Facilities-Zoning', subject: 'Buffer 882 Census', date: '2026-04-07', body: 'Parcel 882 resident count: 0. Reclassification by T. Reed.' },
    { id: 'e_a2_10', from: 'HR Automation', subject: 'Status: ID-4412', date: '2026-04-08', body: 'ID-4412 status: ACTIVE. Dept: Compliance. Sign: M. Solanki.' },

    // 11-30: Anomalies & Contradictions (Mira Solanki / Compliance)
    { id: 'e_a2_11', from: 'System Admin', subject: 'Access Log: Auth 4112', date: '2026-04-09', body: 'Node-06 accessed by 4410 at 02:45. Purpose: Sync.' },
    { id: 'e_a2_12', from: 'M. Solanki', subject: 'Verification SL-4', date: '2026-04-10', body: 'Weight sensor #4112 calibrated. 18kg discrepancy reclassified as residue.' },
    { id: 'e_a2_13', from: 'Elena Kovács', subject: 'Audit Case #A-7712', date: '2026-04-11', body: 'Audit for variance 4112 closed. Numbers match reclassification manifest.' },
    { id: 'e_a2_14', from: 'HR-Operations', subject: 'Reassignment Batch #112', date: '2026-04-12', body: 'Batch relocation complete. Signature: Kovács.' },
    { id: 'e_a2_15', from: 'Internal Audit', subject: 'Variance 4112 Summary', date: '2026-04-13', body: 'Zero anomalies identifying in weekly sync #4112. Lead: 4410.' },
    { id: 'e_a2_16', from: 'Legal', subject: 'Ref: David Bowman', date: '2026-04-14', body: 'Review pending. Fallback protocol 112 active.' },
    { id: 'e_a2_17', from: 'System Admin', subject: 'Weekly Log #4113', date: '2026-04-15', body: 'Log #4113 archived. Sync 4112 successful.' },
    { id: 'e_a2_18', from: 'Procurement-NA', subject: 'P-9002 (Corrected)', date: '2026-04-16', body: 'Manifest updated to 518kg. Original record (500kg) scrubbed.' },
    { id: 'e_a2_19', from: 'Facilities-Mgmt', subject: 'Coolant Levels SL-4', date: '2026-04-17', body: 'Coolant usage up 14%. Output spike noted. Sign: 3124.' },
    { id: 'e_a2_20', from: 'T. Reed', subject: 'Re: Parcel 882 Wait', date: '2026-04-18', body: 'Census mismatch in 882 resolved. Personnel reclassified to REMOVED.' },
    { id: 'e_a2_21', from: 'Elena Kovács', subject: 'Attrition Report Q1', date: '2026-04-19', body: 'Removals: 14. All reclassifications finalized. Attachment: attrition_log.txt', attachment: { name: 'attrition_log.txt', type: 'DATA' } },
    { id: 'e_a2_22', from: 'System Admin', subject: 'Auth 4112 Trace', date: '2026-04-20', body: 'Repetitive auth from ID-4410 noted. Origin: HQ. Pattern: Routine.' },
    { id: 'e_a2_23', from: 'P. Aris', subject: 'Re: P-9003 Deltas', date: '2026-04-21', body: 'Scaling for 9003 shows 822kg. Venn says it\'s expected residue.' },
    { id: 'e_a2_24', from: 'HR Automation', subject: 'Badge 5021 Replaced', date: '2026-04-22', body: 'T. Reed badge active.' },
    { id: 'e_a2_25', from: 'Facilities-NA', subject: 'Zoning Update: Land Map', date: '2026-04-23', body: 'Map for buffer 882 localized to HQ. Regional access restricted.', attachment: { name: 'land_acquisition.txt', type: 'DATA' } },
    { id: 'e_a2_26', from: 'Legal', subject: 'NDA: Compliance Lead', date: '2026-04-24', body: 'Verification protocols for 4410 classified as L3 Internal.' },
    { id: 'e_a2_27', from: 'Internal Audit', subject: 'Closure: Inquiry 4112', date: '2026-04-25', body: 'No process failure. Variance is procedural baggage. Sign: 6193.' },
    { id: 'e_a2_28', from: 'System Admin', subject: 'Log #4114', date: '2026-04-26', body: 'Log #4114 complete. 4112 pattern stable.' },
    { id: 'e_a2_29', from: 'H. Venn', subject: 'Sector 7 Load Adjust', date: '2026-04-27', body: 'Load rebalanced to accommodate increased biological intake.' },
    { id: 'e_a2_30', from: 'Procurement-NA', subject: 'Shipment #X-4112', date: '2026-04-28', body: 'Total biomass intake: 14,000kg. Authorization signature: Mira Solanki.' },

    // 31-60: The Deep Drip (Failing/Boring Procedural)
    ...Array.from({ length: 30 }, (_, i) => {
        const idNum = i + 31;
        const traces = [
            { from: 'System Admin', sub: 'Sync #4112', body: 'Sync successful. ID-4112 auth loop.' },
            { from: 'Procurement', sub: 'Ref: P-9004', body: 'Order 9004 confirmed. Sign: 3124.' },
            { from: 'HR', sub: 'Attendance: 4112', body: 'Compliance ID-4112 active session logged.' },
            { from: 'Facilities', sub: 'Node-07 Temp', body: 'Node-07 variance noted. Reclassification by 5021.' },
            { from: 'Legal', sub: 'Retention #4112', body: 'Data retention for 4112-SYS archived.' }
        ];
        const t = traces[i % traces.length];
        return {
            id: `e_a2_${idNum}`,
            from: t.from,
            subject: `${t.sub} - Batch ${idNum + 400}`,
            date: `2026-05-${(i % 10) + 1}`,
            body: `${t.body} No further action required. Trace ID: 4112-${idNum}.`
        };
    })
];
