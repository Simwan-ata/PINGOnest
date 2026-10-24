# PingoNest ST1 — Legacy Artifact Assessment: PingoNest-14
**Document Identifier:** `ARCH-LEGACY-ST1-012`  
**Target Artifact:** `/public/assets/aistudio/PingoNest-14_c2951f5f.html`  
**Artifact Classification:** `Legacy Single-File Web Application`  
**Author / Creator:** `Alireza Taranejoo`  
**Assessment Mode:** `Non-Contaminating Architectural Assessment & Migration Analysis`  

---

## 1. Executive Summary & Context

The artifact `PingoNest-14_c2951f5f.html` is the legacy single-file HTML release of **PingoNest** (subtitled *"چارت سازمانی پرو · ساختارسازی هوشمند"*). 

### High-Level Summary of Legacy Capabilities:
1. **Interactive D3 Org Chart Canvas:** Hierarchical tree visualization with pan/zoom, node expansion/collapse, drag-and-drop re-parenting, and card rendering (photos, status indicators, subordinate counters).
2. **Matrix & Multi-Dimensional Structure:** Support for matrix project assignments (`projectRoles`: project name, role, allocation percentage) and project-based node highlighting.
3. **Relationship Network Layer:** Non-hierarchical edge connections (`customRels`):
   - Formal: Functional, Advisory, Matrix, Project, Dependency.
   - Informal: Collaboration, Information Flow, Informal Influence, Other.
   - Link attributes: direction (one-way/two-way), strength (1–5), confidence (confirmed, reported, inferred), notes.
4. **BPMN 2.0 Business Process Mapper:**
   - Multi-lane swimlane canvas mapped to departments or roles.
   - Node types: Start events, tasks, decision gateways (exclusive, parallel, inclusive), end events.
   - Process-to-Org Bottleneck Analyzer: Calculates organizational distance (hierarchical steps between actors) across process handoffs.
   - BPMN 2.0 XML import/export.
5. **Organizational Intelligence & Analytics Engine:**
   - Span of control metrics (average, median, max direct reports by department).
   - Data health probes (orphan nodes, cycle detection, root counts).
   - Structural concentration risk (key person dependency).
   - Single-report chains (identifying redundant management layers).
   - Social Network Analysis (SNA): Degree centrality and Brandes betweenness centrality (identifying structural bridge nodes).
   - What-If Scenario Simulations (simulating departure of a key person or merging two departments).
6. **Data Portability:** Excel (`.xlsx`, `.xls`) import/export via SheetJS, PDF export via jsPDF, standalone HTML export.

---

## 2. Architectural Deficiencies in Legacy Baseline (Driver for ST1 Refactor)

While functionally rich on the client side, PingoNest-14 suffered from critical architectural limitations that made enterprise production deployment impossible without the ST1 greenfield refactor:

| Domain | Legacy PingoNest-14 Limitation | PingoNest ST1 Greenfield Architecture Solution |
| :--- | :--- | :--- |
| **Tenancy** | Single-tenant in-memory state. No concept of multi-organization partitioning or workspace boundaries. | Multi-tenant by design (`ENT-ORG`, `ENT-WSP`). All entities strictly partitioned by `org_id`. |
| **Identity & Access** | Zero authentication, zero authorization. Anyone in the browser has full unrestricted write access. | Decoupled IAM: `Subject` (Principal) + `RoleDefinition` (Permissions) + `RoleGrant` (Scoped Grant) + 8-step evaluation pipeline. |
| **Governance & SoD** | No separation of duties, no approval gates. Any manager can delete or move nodes without oversight. | Formal `GovernancePolicy` and `ApprovalRequest` FSM. Self-approval prohibited (`SOD_SELF_APPROVAL_PROHIBITED`). |
| **Temporal Tracking** | Single-snapshot data. `UPDATE` and `DELETE` mutate memory in-place. History is destroyed upon mutation. | Formal `BitemporalInterval` facet (`effective_from/to` vs `recorded_at`). Zero hard deletes; immutable supersession chains. |
| **Audit & Integrity** | Simple unverified localStorage array. Subject to silent modification or erasure. | Cryptographic SHA-256 Merkle hash chaining (`previous_audit_entry_hash` + `post_state_hash` -> `entry_signature_hash`). |
| **Schema & Validation** | Loose property parsing (`r['کد پرسنلی'] ?? r.id`). No formal JSON Schema. | Strict RFC Draft 2020-12 Canonical JSON Schema compiled and verified with Ajv. |

---

## 3. Entity & Concept Translation Matrix (Legacy &rarr; ST1)

| Legacy Concept | Legacy PingoNest-14 Property | ST1 Canonical Entity | ST1 Field Mapping & Type | Semantic Transformation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Employee / Node** | `id`, `name`, `title`, `photo` | `Subject (ENT-SBJ)` | `id: UrnIdentifier` (`urn:pingo:sbj:<uuid>`) | Map string ID to URN UUID. Retain original ID in `metadata.legacy_id`. |
| **Hierarchy** | `parentId` | `Relationship Registry` | `REL-SBJ-SBJ` (Reporting Line) | Convert flat string pointer into formal directed relationship with cycle prevention. |
| **Department** | `department` | `Workspace (ENT-WSP)` | `id: UrnIdentifier`, `org_id: UrnIdentifier` | Elevate flat string into governed tenant boundary. |
| **Employment Status** | `status` ('فعال', 'غیرفعال') | `Subject.status` | `ACTIVE`, `SUSPENDED`, `REVOKED` | Normalize Persian status strings into canonical closed-set enums. |
| **Custom Relations** | `customRels` array | `Relationship Registry` | `REL-EXT-*` | Formalize into typed relationships with directional cardinality and confidence metadata. |
| **Project Roles** | `projectRoles` array | `Nest (ENT-NST)` + `RoleGrant (ENT-RGR)` | `ENT-NST` (Cluster/Project) + `RoleGrant` scoped to `NEST` | Convert ad-hoc project strings into governed resource clusters with scoped role grants. |
| **BPMN Lane / Task** | `proc.lanes`, `proc.nodes` | `Cross-Domain Contract` | `ApprovalRequest (ENT-APR)` | Elevate task workflows into formal dual-custody governance approval pipelines. |

---

## 4. Anti-Corruption Layer (ACL) Ingestion Specification

To import data exported from PingoNest-14 into ST1 without corrupting greenfield invariants:

```
[Legacy Excel / JSON Export]
             |
             v
+---------------------------------------+
|  PingoNest Anti-Corruption Adapter    |
+---------------------------------------+
| 1. Generate UUIDv4 for every entity   |
| 2. Store legacy 'id' in metadata      |
| 3. Normalize status strings to ENUM   |
| 4. Synthesize BitemporalInterval      |
|    - effective_from = legacy_date     |
|    - effective_to = 9999-12-31        |
|    - recorded_at = current_timestamp  |
| 5. Synthesize Genesis Audit Block     |
|    - pre_state_hash = GENESIS_IMPORT  |
|    - sequence_number = 1              |
+---------------------------------------+
             |
             v
[ST1 Canonical Data Bundle (Valid Draft 2020-12)]
```

---

## 5. Architectural Verdict & Recommendations

1. **Preserve Legacy Domain Strengths:** The domain features of PingoNest-14 (hierarchical org chart, matrix project tracking, relationship network mapping, BPMN process bottlenecks, and what-if simulation) are domain-rich and valuable.
2. **Enforce ST1 Architecture as the Control Plane:** All persistence, multi-tenant isolation, authorization, governance, bitemporal intervals, and audit ledgers must strictly follow the ST1 greenfield contract.
3. **Bridge Both Worlds:** The modern ST1 application can provide both:
   - The ST1 Enterprise Governance, IAM, and Chained Audit Engine.
   - The interactive organizational intelligence, relationship visualization, and process mapping pioneered in PingoNest-14.
