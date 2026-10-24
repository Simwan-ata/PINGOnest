# PingoNest ST1 — Traceability Matrix & Decision Log
**Document Identifier:** `ARCH-TRC-ST1-008`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2 & 3)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Architecture Traceability Specification`  

---

## 1. Architectural Decision Log (ADR)

| Decision ID | Context & Problem | Decision Made | Rationale & Alternatives Rejected | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | Entity Primary Identifier Scheme | Use UUIDv4 embedded in canonical URN strings (e.g., `urn:pingo:<type>:<uuid>`). | Rejected sequential integers (leaks volume, prone to cross-tenant collision). URNs provide global collision-free dispatch. | Uniform reference parsing across all contexts. |
| **DEC-002** | Bitemporality vs Simple Timestamps | Formal `BitemporalInterval` facet (`effective_from/to` + `recorded_at`). | Rejected simple `created_at/updated_at` (destroys audit history and regulatory compliance). | Enables point-in-time state reconstruction. |
| **DEC-003** | Deletion Strategy | Soft-deletion via terminal state transitions (`RETIRED`/`DECOMMISSIONED`) and `effective_to` clipping. Hard deletes forbidden. | In-place deletes break cryptographic audit chains and legal discovery mandates. | Zero physical loss of audit records. |
| **DEC-004** | Role Decoupling | Strictly separate `RoleDefinition` from `RoleGrant` and `ScopeRegistry`. | Collapsed role structures make multi-cluster scoping intractable. | High granularity with reusable role definitions. |
| **DEC-005** | Audit Ledger Haining | SHA-256 block chain (`prev_hash + post_state_hash -> signature`). | Rejected unchained text logs (vulnerable to silent tampering). | Provable tamper-evidence for compliance. |

---

## 2. Requirement-to-Test Traceability Matrix

| Requirement ID | Business Objective | Architecture Decision | Entity / Rule | Schema Constraint | Test Case ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `REQ-TENANT-01` | Multi-Tenant Data Isolation | `DEC-001`, `DEC-004` | `ENT-ORG`, `INV-AUTH-02` | `org_id` mandatory FK | `TEST-SEC-001` |
| `REQ-CLUSTER-01` | Hierarchical Resource Nesting | `DEC-001` | `ENT-NST`, `ENT-NOD` | `nest_id` mandatory FK | `TEST-SEM-002` |
| `REQ-TEMPORAL-01` | Point-in-time Historical Auditing | `DEC-002` | `VAL-TMP` | `effective_from <= effective_to` | `TEST-TMP-001` |
| `REQ-GOVERN-01` | Separation of Duties | `DEC-004` | `ENT-POL`, `INV-AUTH-03` | Policy AST expression | `TEST-GOV-001` |
| `REQ-AUDIT-01` | Immutable Cryptographic Audit | `DEC-003`, `DEC-005` | `ENT-AUD` | SHA-256 hex 64 chars | `TEST-AUD-001` |
| `REQ-AUTH-01` | Default-Deny Access Control | `DEC-004` | `ENT-RGR`, `INV-AUTH-01` | Scope match check | `TEST-SEC-002` |
