# PingoNest ST1 — Governance and Policy Model
**Document Identifier:** `ARCH-GOV-ST1-006`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Governance Specification`  

---

## 1. Governance Principles & Hierarchy

PingoNest ST1 treats governance policies as distinct organizational controls that override discretionary permissions. While IAM specifies *what a user could do*, Governance specifies *what an organization permits under regulatory, risk, and operational conditions*.

### Policy Precedence:
1. **Safety & Regulatory Hard-Stops (Highest Precedence):** Zero-exception rules (e.g., prohibition of single-person root cluster deletion).
2. **Separation of Duties (SoD):** Mutual exclusion between conflicting roles (e.g., Auditor cannot hold Deployer grants in Production).
3. **Dual-Custody Approvals:** Operations tagged `HIGH_SEVERITY` require independent secondary subject confirmation.
4. **Discretionary RBAC Grants (Lowest Precedence):** Standard role-based access.

---

## 2. Separation of Duties (SoD) Conflict Matrix

| Role Pair | Conflict Reason | Enforcement Behavior |
| :--- | :--- | :--- |
| `cluster_admin` + `compliance_auditor` | Audit independence violation | Rejection of simultaneous grant assignment |
| `release_deployer` + `change_approver` | Self-approval risk | Approval request rejected if requester == approver |
| `security_admin` + `key_custodian` | Cryptographic split-knowledge requirement | Hard stop veto in identical scope |

---

## 3. Dual-Custody Approval Lifecycle

When a governed action is invoked (e.g., `nest:decommission`, `policy:override`, `pingo:factory_reset`):
1. **Initiation:** The system intercepts the request, blocks execution, and creates an `ApprovalRequest` entity in `PENDING` state.
2. **Review Window:** An expiration deadline is enforced (default: 4 hours).
3. **Attestation:** One or more independent subjects possessing the required `approver` role must cryptographically sign the approval.
4. **Execution:** Upon reaching the required approval quorum, the original action is atomically executed with both requester and approver IDs recorded in the audit ledger.
