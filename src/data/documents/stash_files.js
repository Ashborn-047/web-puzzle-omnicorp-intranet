/**
 * Act II Stash Content
 * 
 * Rules:
 * - Forensic residue, not narrative payoff.
 * - Every L1 name has a SOURCE TRACE.
 */

export const STASH_FILES = {
    'README_FIRST.txt': `This is incomplete.

If you are here,
I was removed before I could finish.

Do not assume intent.
Track repetition.`,

    'open_questions.txt': `Why do attrition numbers align with shipment weight?

Why do overrides never request?

Why does reclassification always follow expansion?`,

    'subordinate_map.txt': `3124 -> Facilities Mgmt (Europe-West), HR Automation (EU-1), Procurement (Regional)
4410 -> Audit Review Queue (HQ), Legal Intake, Compliance (L3 Internal)
5021 -> Engineering Support (NA-7), Zoning (NA), Land Registry
6193 -> HR Reassignment (L1-L3), Audit Oversight (Regional)`,

    'l1_clusters.txt': `[CORRELATION INDEX - L1 CLUSTERS]

NAME: Harold Venn
ID: 3124
ROLE: Regional Operations Director
REGION: EUROPE-WEST
OBSERVED PATTERN: Final authorizer on facilities, HR, and procurement across unrelated sectors. Reroutes weight variances.
SOURCE TRACE:
• Email: Weekly Variance Report ( Harold Venn | ID-3124 )
• Chat: SysAdmin-West — "Authorizations clusters under ID-3124"
• Document: Procurement — "3124-HV"

NAME: Mira Solanki
ID: 4410
ROLE: Compliance Oversight
REGION: HQ
OBSERVED PATTERN: Overrides verification stage. Never requests. Only approves. Clusters around ID-4112 syncs.
SOURCE TRACE:
• Email: Log Auth Code 4112 ( M. Solanki | 4410-HQ )
• Chat: Bio Lab-S7 — "HQ Compliance oversight (4410)"
• Documentation: Facilities — "Auth: M. Solanki"

NAME: Thomas Reed
ID: 5021
ROLE: Infrastructure Expansion Lead
REGION: NORTH-AMERICA
OBSERVED PATTERN: Land acquisition approvals precede staffing reclassification by 30-45 days. Maps Parcel 882 to "Vacant".
SOURCE TRACE:
• Email: Zoning Adjustment ( Thomas Reed | 5021 )
• Chat: Facilities-Ops — "T. Reed signed off"
• Document: Land Acquisition — "5021-TR"

NAME: Elena Kovács
ID: 6193
ROLE: Internal Audit Liaison
REGION: CENTRAL-EU
OBSERVED PATTERN: Audit findings consistently closed without remediation. Reclassifies attrition as "Voluntary Removal".
SOURCE TRACE:
• Email: Audit Case Closure ( E. Kovács | 6193 )
• Chat: HR Automation — "Reclassified by E. Kovács"
• Document: Attrition Log — "6193"`,

    'final_note.txt': `I thought exposure mattered.

It doesn’t.

Correlation does.

If you’re still here,
leave.`
};
