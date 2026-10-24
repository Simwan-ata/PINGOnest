# PingoNest ST1 — Migration and Legacy Boundary
**Document Identifier:** `ARCH-MIG-ST1-009`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 6)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Systems Migration Specification`  

---

## 1. Boundary & Non-Contamination Policy
In accordance with Master Execution Prompt Section 2 & 4.L:
1. **Greenfield Primacy:** The ST1 baseline is developed without dependency on unverified historical prototypes, legacy HTML apps, or undocumented tables.
2. **Anti-Corruption Layer (ACL):** If legacy data must be ingested into ST1 in future phases:
   - All legacy data must pass through an explicit ETL Anti-Corruption Adapter.
   - Any legacy payload lacking modern UUIDs, bitemporal timestamps, or cryptographic audit signatures must be normalized into valid ST1 entities with synthetic genesis audit entries (`pre_state_hash = GENESIS_LEGACY_IMPORT`).
   - Incomplete or ambiguous legacy fields are rejected; no silent data coercion is permitted.

---

## 2. Ingestion Invariant Checklist
- [x] Legacy IDs are mapped to `urn:pingo:<type>:<uuid>` namespaces; original IDs stored strictly in `metadata.legacy_id`.
- [x] Implicit permissions are converted to explicit `RoleGrant` entities.
- [x] All imported records are stamped with `effective_from = legacy_timestamp` and `recorded_at = current_system_time`.
- [x] Audit ledger verifies continuous SHA-256 chain starting from `GENESIS_HASH`.
