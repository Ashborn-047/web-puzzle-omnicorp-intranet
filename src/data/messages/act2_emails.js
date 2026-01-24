/**
 * Act II Emails
 * 
 * 50-60 Emails from various departments.
 * Subtle anomalies in each.
 * Some links unavailable or redacted.
 */

export const ACT2_EMAILS = [
    // HR Notices
    {
        id: 'email_hr_01',
        from: 'OmniCorp HR',
        subject: 'Policy Update: Voluntary Removal',
        date: '2026-05-12',
        body: 'Employees wishing to participate in the "Voluntary Removal" program must sign the attached waiver. Please note that removal is permanent and reassignment is guaranteed.',
        links: [{ text: 'Waiver_v2.pdf', href: '#', status: 'UNAVAILABLE' }]
    },
    {
        id: 'email_hr_02',
        from: 'OmniCorp HR',
        subject: 'Attendance Warning: ID-4492',
        date: '2026-05-13',
        body: 'ID-4492 has failed to check in for 72 hours. Status shifted to "PENDING REMOVAL".',
        links: [{ text: 'Status_Log', href: '/evidence/attrition_log.txt' }]
    },
    // Procurement
    {
        id: 'email_proc_01',
        from: 'Procurement Dept',
        subject: 'Receipt: Apex Solutions (Biomass)',
        date: '2026-05-14',
        body: 'Transaction confirmed. 500 units of "Organic Feedstock" delivered to Sector 7 / Node 666.',
        links: [{ text: 'Manifest_R902', href: '/evidence/equipment_manifest.txt' }]
    },
    {
        id: 'email_proc_02',
        from: 'Procurement Dept',
        subject: 'Correction: Shipment ID-X9',
        date: '2026-05-15',
        body: 'The shipment labeled "Coffee Filters" actually contains L3-grade sensors. Please reroute to David Bowman.',
        links: [{ text: 'Reroute_Form', href: '#', status: 'REDACTED' }]
    },
    // Facilities
    {
        id: 'email_fac_01',
        from: 'Facilities Mgmt',
        subject: 'Land Acquisition Update',
        date: '2026-05-16',
        body: 'The expansion of Sector 7 into the neighboring township is complete. Residents have been "Relocated".',
        links: [{ text: 'Acquisition_Map', href: '/evidence/land_acquisition.txt' }]
    },
    {
        id: 'email_fac_02',
        from: 'Facilities Mgmt',
        subject: 'Sub-Level 4 Warning',
        date: '2026-05-17',
        body: 'Temperature in SL-4 is rising. The system is processing more than planned. Keep the vents clear.',
        links: [{ text: 'Usage_Report', href: '/evidence/facility_usage.txt' }]
    },
    // R&D
    {
        id: 'email_rnd_01',
        from: 'R&D Lead',
        subject: 'Project Omega Status',
        date: '2026-05-18',
        body: 'Correlation is at 94%. We are losing subject integrity, but the system is learning. Proceed with Phase 5.',
        links: [{ text: 'Subject_Log', href: '#', status: 'REDACTED' }]
    },
    {
        id: 'email_rnd_02',
        from: 'R&D Lead',
        subject: 'Anomaly in Node 666',
        date: '2026-05-19',
        body: 'The node is responding to queries that haven\'t been sent yet. Predictive analysis is working too well.',
        links: []
    },
    // Legal
    {
        id: 'email_leg_01',
        from: 'Legal Council',
        subject: 'NDA Reminder: Sector 7',
        date: '2026-05-20',
        body: 'Discussion of "Removal" protocols outside of L3 clearance is a breach of contract resulting in immediate... removal.',
        links: []
    },
    {
        id: 'email_leg_02',
        from: 'Legal Council',
        subject: 'Inquiry: Bowman, David',
        date: '2026-05-21',
        body: 'We have received an external inquiry regarding David Bowman. Please refer to standard response: "No such employee in database".',
        links: []
    },
    // Internal Memos (Adding more to reach 50-60 target volume)
    ...Array.from({ length: 40 }, (_, i) => ({
        id: `email_memo_${i}`,
        from: 'System Admin',
        subject: `Weekly Update #${i + 400}`,
        date: `2026-04-${(i % 30) + 1}`,
        body: `Routine maintenance of Node-${(i * 13) % 999} completed. Efficiency increased by ${(i * 0.1).toFixed(1)}%. Ensure all badge readers are sanitized.`,
        links: []
    }))
];
