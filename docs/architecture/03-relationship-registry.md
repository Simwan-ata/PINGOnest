# PingoNest ST1 — Relationship and Cardinality Registry
**Document Identifier:** `ARCH-REL-ST1-003`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Data Architecture Specification`  

---

## 1. Cardinality & Relationship Matrix

| Rel ID | Source Entity | Target Entity | Meaning | Source Mult. | Target Mult. | Participation | Cascade / Retention Policy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `REL-ORG-WSP` | `Organization` | `Workspace` | Organization partitions Workspaces | 1 | 0..* | Source Mandatory, Target Optional | Soft cascade: suspending Org suspends all Workspaces |
| `REL-WSP-NST` | `Workspace` | `Nest` | Workspace houses Nests | 1 | 0..* | Source Mandatory, Target Optional | Soft cascade: deactivating Workspace pauses Nests |
| `REL-NST-NOD` | `Nest` | `PingoNode` | Nest clusters PingoNodes | 1 | 0..* | Source Mandatory, Target Optional | Decommissioning Nest requires draining Nodes |
| `REL-ORG-SBJ` | `Organization` | `Subject` | Org employs/authorizes Subjects | 1 | 1..* | Both Mandatory (Org must have >=1 Admin) | Disabling Org immediately revokes active Subject sessions |
| `REL-SBJ-ACC` | `Subject` | `Account` | Subject owns Authentication Accounts | 1 | 1..* | Source Mandatory, Target Mandatory | Revoking Subject locks all associated Accounts |
| `REL-SBJ-RGR` | `Subject` | `RoleGrant` | Subject receives Role Grants | 1 | 0..* | Source Mandatory, Target Optional | Inactive Subject suppresses all RoleGrants |
| `REL-ROL-RGR` | `RoleDefinition`| `RoleGrant` | RoleDefinition is assigned via Grants | 1 | 0..* | Source Mandatory, Target Optional | Deprecating RoleDefinition prevents new Grants |
| `REL-POL-APR` | `GovernancePolicy`| `ApprovalRequest` | Policy triggers Approval Requests | 1 | 0..* | Source Mandatory, Target Optional | Policy changes do not alter historic closed approvals |
| `REL-ORG-POL` | `Organization` | `GovernancePolicy` | Org establishes Governance Policies | 1 | 0..* | Source Mandatory, Target Optional | Org-level default baseline policies apply |
| `REL-ORG-AUD` | `Organization` | `AuditTransactionRecord` | Org maintains cryptographic Audit Ledger | 1 | 1..* | Source Mandatory, Target Mandatory | Append-Only, Immutable forever (Zero-Deletion) |

---

## 2. Invariant Rules on Relationships

1. **Strict Upward Ownership (No Multi-Parenting):**
   - A `PingoNode` belongs to exactly ONE `Nest`. Cross-nest node pooling is prohibited in ST1.
   - A `Nest` belongs to exactly ONE `Workspace`.
   - A `Workspace` belongs to exactly ONE `Organization`.
2. **Strict Scope-Target Validation:**
   - A `RoleGrant` targeting `scope_type = NEST` MUST have a `scope_target_id` that resolves to a valid `Nest` belonging to the same `Organization` as the `Subject`.
   - Cross-tenant role granting is strictly rejected by the semantic validator.
3. **Quorum & Orphan Prevention:**
   - An `Organization` must never transition to `ACTIVE` unless at least one `Subject` with the `org_admin` role definition exists and is in `ACTIVE` status.
4. **Historical Referential Integrity:**
   - Foreign key references in audit logs and historical supersession records point to immutable historical snapshot hashes or URNs. Renaming or soft-deleting an entity never invalidates historical references.
