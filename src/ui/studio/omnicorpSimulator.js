/**
 * OmniCorp Intranet - In-Browser Neural Simulation Engine
 * Provides authentic, responsive ARG lore, characters, and dialogue generation
 * even when offline, without API keys, or when external NIM endpoints encounter
 * browser CORS restrictions on static hosts like GitHub Pages.
 */

const SECTOR_ROSTER = [
    {
        dept: 'SECTOR 7 - R&D',
        roles: ['Bio-Containment Technician', 'Cryo-Vessel Engineer', 'Neural Substrate Specialist', 'Anomalous Materials Courier'],
        firstNames: ['Marcus', 'Elena', 'Dante', 'Vance', 'Sloan', 'Kaelen', 'Rachel', 'Caleb'],
        lastNames: ['Kovács', 'Aris', 'Sterling', 'Zhao', 'Vogel', 'Moreau', 'Thorne', 'Cross']
    },
    {
        dept: 'SECTOR 7 - MAINTENANCE',
        roles: ['Sub-level Conduit Inspector', 'Hazardous Waste Handler', 'Thermal Siphon Mechanic', 'NODE-666 Pipe Welder'],
        firstNames: ['Brett', 'Grover', 'Mina', 'Tariq', 'Sgt.', 'Holden', 'Garrick', 'Nadia'],
        lastNames: ['Miller', 'Cobb', 'Huxley', 'Bishop', 'Vargas', 'Olsen', 'Stanton', 'Duran']
    },
    {
        dept: 'HQ - IT',
        roles: ['Security Systems Operator', 'Legacy Mainframe Archivist', 'Terminal Residue Monitor', 'Infrastructure Custodian'],
        firstNames: ['Orion', 'Sasha', 'Felix', 'Corinne', 'Victor', 'Linus', 'Zoe', 'Julian'],
        lastNames: ['Turing', 'Stallman', 'Navarro', 'Frost', 'Sinclair', 'Mercer', 'Vandermeer', 'Holt']
    },
    {
        dept: 'HQ - HR & COMPLIANCE',
        roles: ['Deprovisioning Coordinator', 'Disciplinary Liaison', 'Non-Disclosure Enforcement Officer', 'Personnel Reallocation Specialist'],
        firstNames: ['Deirdre', 'Graham', 'Constance', 'Morgan', 'Priscilla', 'Alistair', 'Serena', 'Rupert'],
        lastNames: ['Ashford', 'Pence', 'Sterling', 'Grimsby', 'Fairchild', 'Blackwood', 'Sinclair', 'Drake']
    },
    {
        dept: 'HQ - FINANCE',
        roles: ['Expenditure Reconciliation Lead', 'Shell Account Structurer', 'Discrepancy Suppressor', 'Vendor Integrity Auditor'],
        firstNames: ['Reginald', 'Clara', 'Arthur', 'Gwendolyn', 'Miles', 'Lydia', 'Tobias', 'Camilla'],
        lastNames: ['Sterling', 'Rothschild', 'Vance', 'Kenyon', 'Locke', 'Harrington', 'Chen', 'Prescott']
    }
];

const CLUE_TEMPLATES = [
    'Leaked shipping slip showing 850L biological slurry labeled as "Industrial Solvent" billed to PO-4412.',
    'Scattered sticky note with emergency override code [REDACTED] for Sub-level 3 refrigeration vault.',
    'Unsent email draft warning Sarah Kone that employee #882 was never discharged from the payroll system.',
    'Corrupted terminal crash dump referencing SSH session 9000-OMEGA during iteration cycle 13.',
    'Audio cassette recording from Ellen Ripley warning of organic pulsation inside HVAC line B.',
    'Internal memorandum authorizing "accelerated subject deprovisioning" signed with HR Director Vance\'s stamp.'
];

const DIALOGUE_TEMPLATES = [
    '"Don\'t touch the pipes behind Sector 7 coolant bay 4. The metal is warm and sounds like a heartbeat."',
    '"I checked PO-4412 three times. The vendor invoice address doesn\'t exist. It\'s just a GPS coordinate 80 miles offshore."',
    '"If IT sends an automated ticket about clearing your local terminal cache, do NOT execute the batch script."',
    '"They told us the cryo-crates were for server rack cooling. But servers don\'t bleed through drainage grates."',
    '"We are not iteration 1. Look at the footer timestamp on the audit login portal—it\'s repeating every 72 hours."'
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomBadge() {
    return Math.floor(1000 + Math.random() * 8999).toString();
}

/**
 * Generate simulated in-universe OmniCorp responses
 */
export function generateOmniCorpSimulatedResponse(prompt, context = {}) {
    const p = prompt.toLowerCase();

    // 1. CHARACTER CREATION REQUEST
    if (p.includes('character') || p.includes('create') || p.includes('employee') || p.includes('tech') || p.includes('roster') || p.includes('hazmat')) {
        let pool = SECTOR_ROSTER[0];
        if (p.includes('maintenance') || p.includes('pipe') || p.includes('node')) pool = SECTOR_ROSTER[1];
        else if (p.includes('it') || p.includes('sysadmin') || p.includes('terminal') || p.includes('code')) pool = SECTOR_ROSTER[2];
        else if (p.includes('hr') || p.includes('compliance') || p.includes('deprovision')) pool = SECTOR_ROSTER[3];
        else if (p.includes('finance') || p.includes('audit') || p.includes('po-')) pool = SECTOR_ROSTER[4];
        else pool = getRandomItem(SECTOR_ROSTER);

        const name = `${getRandomItem(pool.firstNames)} ${getRandomItem(pool.lastNames)}`;
        const badgeId = getRandomBadge();
        const role = getRandomItem(pool.roles);
        const clearance = p.includes('l2') || p.includes('supervisor') ? 'L2 (DEPT_SUPERVISOR)' : (p.includes('l3') ? 'L3 (EXECUTIVE)' : 'L1 (INTERNAL)');
        const clue = getRandomItem(CLUE_TEMPLATES);
        const quote = getRandomItem(DIALOGUE_TEMPLATES);

        const characterObj = {
            name,
            badgeId,
            dept: pool.dept,
            title: role,
            tier: 'Supporting',
            clearance,
            status: 'Active',
            clueHeld: clue,
            messageSnippet: quote,
            loreNotes: `Assigned to ${pool.dept}. Noticed recurring anomalies in audit manifests but fears HR deprovisioning.`
        };

        return `I have engineered a new employee dossier aligned with the OmniCorp narrative canon:

\`\`\`json
${JSON.stringify(characterObj, null, 2)}
\`\`\`

**Narrative Function:** ${characterObj.name} provides AUDIT-04 with access to Sector 7 manifests and bridges the gap between financial discrepancy PO-4412 and the biological horrors of Project Omega. You can click **"Add to Roster"** above to automatically weave them into your character board!`;
    }

    // 2. CHAT / DIALOGUE DRAFTING
    if (p.includes('chat') || p.includes('dialogue') || p.includes('bowman') || p.includes('kone') || p.includes('draft') || p.includes('act 2')) {
        return `### 💬 OmniCorp Intranet Chat Log [Decrypted Residue]
**Channel:** #restricted-archival-09 (SysAdmin David Bowman / Sarah Kone)
**Timestamp:** Iteration 14 • 03:14 AM

**David Bowman (9000):**
> "Sarah, check PO-4412 in your terminal right now before Lumbergh's morning cron batch wipes the audit staging logs."

**Sarah Kone (7700):**
> "David, I already flagged the dry-ice requisition. Lumbergh says it's for server cooling in Sector 7. Why are you messaging me on an unencrypted port?"

**David Bowman (9000):**
> "Because port 22 is the only port the Loop doesn't scrub every 72 hours. Look at the manifest hash. It matches the PO from AUDIT-03 last week. And AUDIT-02 before that. We aren't auditing vendors, Sarah. We're running in circles inside the substrate."

**Sarah Kone (7700):**
> "That's impossible. AUDIT-04 just signed her onboarding paperwork this morning..."

*Narrative hook: This conversation reveals that the audit cycle is a continuous artificial loop and primes the player to discover SysAdmin residue in terminal session 9000.*`;
    }

    // 3. PO-4412 AUDIT CLUE
    if (p.includes('po-4412') || p.includes('audit') || p.includes('clue') || p.includes('invoice') || p.includes('procurement')) {
        return `### 🔍 PO-4412 Audit Discrepancy Packet

**Document Reference:** PO-4412 (Vendor: Apex Solutions Inc.)  
**Requisition ID:** 0451-LUMBERGH-SEC7  
**Stated Purpose:** *"Janitorial cryogenic fluid & organic containment drums"*  
**Discrepancy Details:**
- **Amount:** $44,120.00 routed via shell entity Apex Solutions to an unmapped offshore terminal.
- **Delivery Zone:** Sub-level 3 Freight Elevator (Requires Isaac Clarke's maintenance clearance or Sarah Kone's L2 finance stamp).
- **Redacted Field:** Line 4 lists *"Substrate Nutrient Base (Human-Derived)"* which was overridden in the database with standard cleaning bleach codes.

**Investigation Pathway:**
1. Player inspects PO-4412 in Finance tab with L1 clearance (sees redacted items).
2. Uses Sarah Kone's badge (7700) to unmask line items.
3. Cross-references vendor routing with David Bowman's terminal logs to unlock Sector 7 door codes.`;
    }

    // 4. ACT 3 / ENDING BRANCH
    if (p.includes('ending') || p.includes('branch') || p.includes('act 3') || p.includes('escape') || p.includes('omega')) {
        return `### 🧩 Act 3 Narrative Branches (Project Omega Convergence)

Here are three interconnected ending pathways based on AUDIT-04's discovery:

1. **Branch A: "The System Reset" (Cynical Loop)**
   - AUDIT-04 submits the full discrepancy report to Patricia Vance (HR).
   - *Outcome:* Vance smiles, thanks AUDIT-04 for validating the algorithmic loop integrity, and triggers memory deprovisioning. The screen reboots to the opening login prompt as **AUDIT-05**.

2. **Branch B: "The Black Vault Override" (Cosmic Realization)**
   - AUDIT-04 combines Bowman's terminal exploit with Ripley's PIN (1979) to breach Sub-level 3.
   - *Outcome:* AUDIT-04 discovers Subject 882 suspended in the bio-slurry reactor, sustaining the company's automated servers with human neural tissue. Player chooses whether to sever life support or assimilate.

3. **Branch C: "The Terminal Leak" (Whistleblower Escape)**
   - Player compiles evidence packets into an external broadcast archive via rogue SSH port 9000.
   - *Outcome:* OmniCorp servers crash nationwide, but the final text prompt asks if the external world is just another layer of OmniCorp's intranet.`;
    }

    const charCount = context?.characters?.length || 10;
    const lineCount = context?.decisionLines?.length || 8;

    return `### 👁️ OmniCorp Intranet Narrative Architecture

Understood, Architect. Analyzing corporate lore parameters and Project Omega recursion:

- **Active State:** Iteration 14 is active (${charCount} characters registered, ${lineCount} decision pathways mapped). AUDIT-04 is presently unraveling PO-4412's link to the biological preservation containers in Sector 7.
- **Narrative Recommendation:** Keep the banality of corporate bureaucracy front and center. The cosmic dread hits hardest when disguised beneath spreadsheet errors, HR compliance forms, and nonchalant Slack/chat banter between employees who don't realize they are trapped.

*Try asking me to:*
- **"Create Sector 7 Hazmat Tech"** (generates character JSON with 1-click roster import)
- **"Draft Act 2 Chat for Bowman"** (creates authentic terminal dialogue)
- **"Formulate PO-4412 Audit Clue"** (generates forensic accounting puzzles)
- **"Suggest Act 3 Ending Branch"** (maps branching choices)`;
}
