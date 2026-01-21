# OmniCorp Intranet - Puzzle Design Documentation

This document outlines the game mechanics, puzzle logic, and trigger system for the OmniCorp Intranet simulation.

## 1. Core Access Hierarchy

| Level | Role | Directory Access | Audit Access |
|-------|------|------------------|--------------|
| **EXTERNAL (0)** | `AUDITOR_TEMP` | Names Only. All IDs Redacted. | Can flag fraud, but Suspect ID is Redacted. |
| **L1 (1)** | Interns/Staff | Names Only. Own ID visible. | N/A |
| **L2 (2)** | Admins / Dept Heads | See IDs in **own department**. | Can see suspect ID in audit reports. |
| **L3 (3)** | Executives / HR | See all IDs (HR Access). | Full access. |
| **OMEGA (4)** | `OVERSEER` | See Everything. | Full access. |

---

## 2. Puzzle Golden Path

### Phase 1: The Breach
- **Actor**: `AUDIT-04` (Temp Auditor)
- **Login Hint**: Sticky note on the login screen.
- **Activity**: Access the Finance Audit tab.
- **Trigger**: Upon entry, Sarah Kone (Chief Auditor) sends a system notification reminding the auditor to look for "structuring" patterns.
- **Action**: Use the Finance Audit tool to flag transactions to "Apex Solutions" that are just under the $5,000 threshold.

### Phase 2: Identifying the Suspect
- **Discovery**: Successfully flagging the fraud reveals an audit report stating the payments were authorized by `[REDACTED - L2 CLEARANCE REQUIRED]`.
- **The Clue**: Check the Messages tab. Sarah Kone's signature contains her badge ID: `7700`.
- **The Leap**: Use the Login Hint (Omni + ID) to log in as Sarah Kone (`7700` / `Omni7700`).

### Phase 3: Forensic Audit
- **Actor**: `7700` (Sarah Kone - L2 Clearance)
- **Activity**: Re-run the audit. Because Sarah has L2 clearance, the report now reveals: `Authorized by ID 9000`.
- **The Clue**: Search the Directory. Sarah can see IDs in her department and some corporate-wide headers. ID `9000` is David Bowman (SysAdmin).
- **Goal**: Login as David Bowman (`9000` / `Omni9000`).

### Phase 4: Lateral Movement
- **Actor**: `9000` (David Bowman - SysAdmin)
- **Activity**: Access the **Sys Terminal**.
- **Discovery**: David's messages mention a detected SSH session.
- **Command**: Run `list_users` in the terminal to see active sessions. Discover ID `4492` (Patricia Vance, HR Director).
- **Action**: Use `ssh 4492` to hijack her session.

### Phase 5: The Black Vault
- **Actor**: `4492` (Patricia Vance)
- **Activity**: Navigate to **Secure Archives**. Access the "Black Files" folder.
- **Obstacle**: Folder is protected by a 4-digit PIN.
- **The Clue**: Read the deleted message from Ellen Ripley (`1979`) recovered in the archive. It hints that her ID is the key to the vault.
- **Action**: Search Directory for Ellen Ripley -> ID `1979`. Enter PIN `1979`.

### Phase 6: Project Omega (Finale)
- **Activity**: Access the restricted **Project Omega** tab.
- **The Challenge**: Enter three containment keys to purge the system.
- **Key Discovery**:
    - **ALPHA**: `1980` (From History tab - "The First Purge").
    - **BETA**: `882` (Private message from the Overseer to Patricia).
    - **GAMMA**: `NODE-666` (Mentioned in Infrastructure status and David Bowman's logs).
- **Result**: System Purge / Ending Sequence.

---

## 3. System Triggers

| Trigger Event | Payload | Frequency |
|---------------|---------|-----------|
| **Tab Switch (Finance)** | Sarah Kone Hint (if user is Auditor) | Once |
| **Audit Success** | Redacted ID (L0) / Visible ID (L2+) | Permanent |
| **Terminal `ssh`** | User Session Swap | Dynamic |
| **Vault Unlock** | Access to Omega Tab | Persistent |
| **Key Entry** | Game Ending Sequence | Terminal |
