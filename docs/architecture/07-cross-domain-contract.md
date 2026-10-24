# PingoNest ST1 — Cross-Domain Integration Contract
**Document Identifier:** `ARCH-XDOM-ST1-007`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Systems Integration Specification`  

---

## 1. Universal Transaction Pipeline (10-Step Execution Contract)

Every mutating operation in PingoNest ST1 must follow this unified 10-step atomic sequence:

1. **Input Normalization & Preconditions:** Validate input schema format, check mandatory UUID formats, sanitize string payloads.
2. **Identity & Authentication:** Resolve the caller's active `Subject` and authenticated `Account`.
3. **Temporal Validity Check:** Verify system wall-clock against effective intervals of participating entities.
4. **Authorization Evaluation:** Verify RBAC grants covering requested `action` on target `resource` within valid `scope`.
5. **Lifecycle State Guard:** Assert that target entity is in an operational state that accepts mutations (e.g., cannot modify `RETIRED` or `DECOMMISSIONED` entities).
6. **Governance & SoD Check:** Verify that operation does not trigger an unapproved SoD conflict or missing dual-custody approval.
7. **Entity State Computation:** Calculate new entity snapshot; generate pre-state and post-state SHA-256 hashes.
8. **Cryptographic Ledger Chaining:** Retrieve latest tenant sequence number; compute `previous_hash + post_state_hash -> entry_signature_hash`.
9. **Atomic Commit:** Write entity mutation and audit record in a single transactional boundary.
10. **Event Emission & Rollback Guard:** Emit domain event to internal bus; on any error at steps 1-9, abort transaction completely, fail closed, and log security incident.

---

## 2. Cross-Domain Failure Matrix

| Failure Mode | Step | System Behavior | HTTP Status / Code | Audit Output |
| :--- | :--- | :--- | :--- | :--- |
| Expired RoleGrant | Step 3 | Reject operation immediately | `403 FORBIDDEN (GRANT_EXPIRED)` | Auth Deny Audit Record |
| Decommissioned Nest Mutation | Step 5 | Reject modification of terminal entity | `409 CONFLICT (LIFECYCLE_TERMINAL)` | Lifecycle Veto Record |
| Self-Approval Attempt | Step 6 | Intercept and reject approval | `403 FORBIDDEN (SOD_SELF_APPROVAL_PROHIBITED)`| Security Incident Record |
| Ledger Hash Divergence | Step 8 | Lock tenant mutations, trigger tamper alarm | `500 INTERNAL_ERROR (LEDGER_INTEGRITY_BREACH)`| Critical System Tamper Alert |
