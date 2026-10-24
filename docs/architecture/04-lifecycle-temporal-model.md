# PingoNest ST1 — Lifecycle and Temporal Model
**Document Identifier:** `ARCH-LIFE-ST1-004`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Core Systems Specification`  

---

## 1. Canonical Lifecycle States & Vocabulary

The PingoNest ST1 engine enforces deterministic finite state machines (FSM) across core aggregates:

```
[DRAFT / PROVISIONING] ---> [ACTIVE / HEALTHY] <---> [SUSPENDED / DEGRADED]
                                    |
                                    v
                           [DRAINING / PENDING]
                                    |
                                    v
                         [RETIRED / DECOMMISSIONED] (Terminal)
```

### State Definition Vocabulary:
1. `DRAFT` / `PROVISIONING`: Entity is instantiated in memory/storage; configuration incomplete; not eligible for operational traffic or authorization decisions.
2. `ACTIVE` / `HEALTHY`: Fully operational, passes health probes, actively participates in routing, scheduling, and policy enforcement.
3. `SUSPENDED` / `DEGRADED`: Temporarily halted by administrative action or failing health telemetry. Grants associated with suspended entities fail closed (default-deny).
4. `DRAINING`: Transitional state for Nests/Nodes completing existing workloads without accepting new sessions.
5. `RETIRED` / `DECOMMISSIONED` / `REVOKED`: Terminal state. Cannot be reactivated. Read-only historical retention.

---

## 2. Finite State Machine (FSM) Transition Matrices

### 2.1 Organization / Workspace FSM
| From State | Allowed Target State | Preconditions & Invariants | Prohibited Transitions |
| :--- | :--- | :--- | :--- |
| `DRAFT` | `ACTIVE` | At least 1 active Admin Subject; contact email verified | -> `RETIRED` (must activate or discard) |
| `ACTIVE` | `SUSPENDED` | Explicit security or billing hold; emits audit alert | Direct to `RETIRED` if active Nests exist |
| `SUSPENDED` | `ACTIVE` | Administrative review approval logged | Cannot transition to `DRAFT` |
| `ACTIVE` / `SUSP` | `RETIRED` | All child Nests must be in `DECOMMISSIONED` status | Terminal: cannot transition to any state |

### 2.2 Nest & PingoNode FSM
| From State | Allowed Target State | Trigger / Guard |
| :--- | :--- | :--- |
| `PROVISIONING` | `ACTIVE` / `HEALTHY` | Initial handshake + cryptographic attestation verified |
| `ACTIVE` | `DEGRADED` | Heartbeat missed for > 3x `heartbeat_interval_sec` |
| `DEGRADED` | `ACTIVE` | Consecutive successful heartbeats >= 3 |
| `ACTIVE` | `DRAINING` | Admin initiated graceful evacuation |
| `DRAINING` | `DECOMMISSIONED`| Active node workloads count == 0 |
| `DECOMMISSIONED`| None (Terminal) | Immutable record archived in audit ledger |

---

## 3. Bitemporal Semantics & Header Facet

Every stateful entity in PingoNest ST1 embeds a standardized `BitemporalInterval` value object:

```json
{
  "effective_from": "2026-10-18T00:00:00.000Z",
  "effective_to": "9999-12-31T23:59:59.999Z",
  "recorded_at": "2026-10-18T21:55:00.123Z",
  "recorded_by_subject_id": "urn:pingo:sbj:98765432-1234-5678-9abc-def012345678",
  "supersedes_record_id": null,
  "is_current_valid_snapshot": true
}
```

### Temporal Rules:
1. **Effective Time (`effective_from` -> `effective_to`):** Represents business reality (e.g., when a role grant or policy takes effect). Defaults to current UTC timestamp up to the open-ended temporal horizon (`9999-12-31T23:59:59.999Z`).
2. **Recorded Time (`recorded_at`):** Transaction clock timestamp generated strictly by the server system of record. Immutable and monotonic.
3. **Temporal Non-Overlap Invariant:** For any given entity identifier `E` and time instant `t`, there must exist at most ONE snapshot where `effective_from <= t < effective_to` and `is_current_valid_snapshot == true`.
4. **Correction via Supersession:** To modify a past record without falsifying history:
   - Mark the original record's `effective_to` to the correction split point.
   - Insert the new version referencing `supersedes_record_id = original.id`.
   - Record an immutable audit log linking both entries.
