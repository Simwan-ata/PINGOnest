# PingoNest ST1 — Architecture Charter
**Document Identifier:** `ARCH-CHARTER-ST1-001`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 1)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Architecture Specification`  

---

## 1. System Purpose & Core Mission
PingoNest ST1 is a secure, multi-tenant enterprise orchestration and distributed resource clustering platform. The system coordinates hierarchical organizations, isolated workload/resource clusters ("Nests"), and registered endpoint/service instances ("Pingos") under a zero-trust, policy-governed, bi-temporally auditable operating model.

The platform provides:
1. **Multi-Tenant Isolation:** Complete logical separation of organizational assets, configurations, and administrative boundaries.
2. **Hierarchical Resource Clustering:** Logical aggregation of compute, devices, or service nodes into governed clusters ("Nests").
3. **Rigorous Policy & Governance:** Explicit separation of duties, dual-custody approval workflows, and attribute-based security enforcement.
4. **Bi-Temporal Audit Provenance:** Cryptographically chained, immutable ledgers distinguishing business effective time from physical recording time.

---

## 2. In-Scope vs. Out-of-Scope Capabilities

### In-Scope (ST1 Baseline)
- **Tenant Management:** Multi-organization isolation, workspace boundaries, and membership lifecycle.
- **Resource Hierarchy:** Definition and lifecycle of Nests (clusters/containers) and Pingos (registered nodes/services/endpoints).
- **Identity & Authorization:** Principal identity, role definitions, granular role grants, hierarchical scoping (Global, Org, Nest, Node), and default-deny evaluation engine.
- **Governance & Policy Rules:** Separation of duties (SoD), conflict-of-interest prevention, policy effective periods, and mandatory approval gates.
- **Temporal & Lifecycle Mechanics:** Formal finite state machines (FSM) for all primary entities, explicit bitemporal intervals (`valid_from` to `valid_to` vs. `recorded_at`), and immutable supersession chains.
- **Audit & Provenance Ledger:** Tamper-evident transaction logging with SHA-256 state hashing and causal actor tracking.
- **Formal Schema & Test Harness:** RFC-compliant JSON Schema definitions and automated test suites for semantic, structural, and security invariants.

### Out-of-Scope (Deferred to Post-ST1)
- Physical hardware device firmware flashing / low-level driver execution.
- Cross-cloud live virtual machine migration.
- Raw high-frequency streaming telemetry ingestion (>100k events/sec per node) — ST1 defines the control plane and audit boundary, not high-volume time-series storage.
- External payment gateway billing automation.

---

## 3. Bounded Contexts & Domain Boundaries

The PingoNest ST1 architecture is partitioned into six distinct bounded contexts:

```
+-----------------------------------------------------------------------------------+
|                            PingoNest ST1 Ecosystem                                |
+-----------------------------------------------------------------------------------+
|  1. Tenancy & Organization Context                                                |
|     - Organization, Workspace, TenantQuota, Membership                           |
+-----------------------------------------------------------------------------------+
|  2. Identity & Access Control (IAM) Context                                       |
|     - Subject (User/Service), Account, RoleDefinition, RoleGrant, ScopeRegistry   |
+-----------------------------------------------------------------------------------+
|  3. Cluster & Resource Hierarchy Context                                          |
|     - Nest (Cluster Domain), PingoNode (Registered Service/Resource/Device)       |
+-----------------------------------------------------------------------------------+
|  4. Governance & Policy Context                                                   |
|     - GovernancePolicy, PolicyRule, ApprovalWorkflow, SeparationOfDutiesMatrix    |
+-----------------------------------------------------------------------------------+
|  5. Temporal & Lifecycle State Context                                            |
|     - StateTransitionEvent, BitemporalInterval, SupersessionRecord                |
+-----------------------------------------------------------------------------------+
|  6. Provenance & Audit Ledger Context                                             |
|     - AuditTransactionRecord, CryptographicMerkleHash, ActorAttribution           |
+-----------------------------------------------------------------------------------+
```

---

## 4. Core Architectural Principles
1. **Zero-Trust & Default-Deny:** Access is denied unless an explicit, active, temporally valid role grant or policy permit exists within the target scope.
2. **Explicit Bitemporality:** Every business fact records both:
   - *Effective Time:* When the fact is true in the real world (`valid_from`, `valid_to`).
   - *Recorded Time:* When the fact was committed into the system (`recorded_at`, `recorded_by`).
3. **Immutability of Historical Records:** Historical states are never overwritten or deleted (`UPDATE` / `DELETE` in-place are prohibited). Corrections occur exclusively via supersession records.
4. **Separation of Definition from Assignment:** Roles are pure permission sets; assignments link subjects to roles within scopes; policies constrain grants dynamically.
5. **Deterministic State Transitions:** Entity lifecycles follow closed-set state transition tables. Illegal transitions trigger strict rejection and security audit alerts.
6. **Domain Decoupling:** Bounded contexts communicate through explicit contract interfaces, canonical identifiers, and immutable event payloads.

---

## 5. Trust Boundaries & Security Objectives
- **Boundary T1 (External / Client to Gateway):** Transport Layer Security (TLS 1.3), authenticated sessions, rate limiting.
- **Boundary T2 (Inter-Tenant Boundary):** Strict logical isolation via tenant partition keys (`org_id`). Zero cross-tenant entity references without explicit federation contracts.
- **Boundary T3 (Administrative / Governance Gate):** Critical actions (policy mutation, role definition updates, cluster retirement) require dual-custody approval and step-up authentication.
- **Boundary T4 (Audit Vault):** Audit ledger entries are append-only; cryptographic hash verification detects any storage tampering.

---

## 6. Non-Functional Requirements (NFRs)
- **NFR-SEC-01 (Access Decision Latency):** Authorization evaluation must resolve in under 10ms for cached policy graphs.
- **NFR-REL-01 (Referential Integrity):** Orphaned references are strictly prevented via foreign key / reference constraints.
- **NFR-AUD-01 (Traceability):** 100% of state-altering operations must produce an immutable audit transaction record.
- **NFR-CMP-01 (Validation Compliance):** All data exchange payloads must conform 100% to the Canonical JSON Schema.

---

## 7. Initial Assumptions & Open Questions Register

### Consequential Assumptions (Recorded Engineering Defaults)
- **ASSUMP-001 (Identifier Format):** All canonical entities use UUIDv4 formatted as lowercase string URNs (e.g., `urn:pingo:org:550e8400-e29b-41d4-a716-446655440000`) for globally unique, deterministic referencing.
- **ASSUMP-002 (Soft Deletion via State):** Hard deletion is prohibited for compliance. Deletion is represented as a lifecycle transition to `RETIRED` or `ARCHIVED` with `valid_to` timestamp set.
- **ASSUMP-003 (Auditing Model):** Cryptographic linkage is achieved using SHA-256 block hash chaining (`previous_hash` + `payload_hash` -> `entry_hash`).

### Open Questions (Requiring Future Business / Operator Input)
- **OQ-001 (Retention Duration):** Default retention window for `ARCHIVED` entities is assumed to be 7 years unless organization regulatory profiles specify otherwise.
- **OQ-002 (Federation Scope):** Cross-organization shared Nests are deferred from ST1 baseline and will be evaluated in ST2.
