# PingoNest ST1 — Canonical Entity Dictionary
**Document Identifier:** `ARCH-DICT-ST1-002`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Data Architecture Specification`  

---

## 1. Entity Inventory Overview

| Entity Name | Stable Identifier Code | Bounded Context | Classification | Mutability |
| :--- | :--- | :--- | :--- | :--- |
| **Organization** | `ENT-ORG` | Tenancy & Organization | Root Aggregate Entity | Mutable via Versioning |
| **Workspace** | `ENT-WSP` | Tenancy & Organization | Entity | Mutable via Versioning |
| **Subject** | `ENT-SBJ` | Identity & Access Control | Entity | Mutable via Versioning |
| **Account** | `ENT-ACC` | Identity & Access Control | Entity | Mutable via Versioning |
| **RoleDefinition** | `ENT-ROL` | Identity & Access Control | Entity | Versioned Entity |
| **RoleGrant** | `ENT-RGR` | Identity & Access Control | Associative Entity | Temporal Entity |
| **ScopeRegistry** | `ENT-SCP` | Identity & Access Control | Entity | Immutable per Resource |
| **Nest** | `ENT-NST` | Cluster & Resource Hierarchy | Aggregate Entity | Mutable via Versioning |
| **PingoNode** | `ENT-NOD` | Cluster & Resource Hierarchy | Entity | Mutable via Versioning |
| **GovernancePolicy** | `ENT-POL` | Governance & Policy | Aggregate Entity | Versioned Entity |
| **ApprovalRequest** | `ENT-APR` | Governance & Policy | Entity | Finite State Machine |
| **AuditTransactionRecord** | `ENT-AUD` | Provenance & Audit | Event / Ledger Record | Append-Only (Immutable) |
| **BitemporalInterval** | `VAL-TMP` | Cross-Domain Facet | Value Object | Immutable Value Object |

---

## 2. Field-Level Entity Specifications

### 2.1 Organization (`ENT-ORG`)
- **Business Purpose:** Represents the primary tenant boundary. All data, resources, roles, and policies must resolve to a valid organization.
- **Primary Identifier:** `id` (URN UUIDv4, e.g., `urn:pingo:org:550e8400-e29b-41d4-a716-446655440000`)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `slug`: `string` (RegEx: `^[a-z0-9-]+$`, 3-64 chars) [Required, Non-nullable, Unique]
  - `display_name`: `string` (1-128 chars) [Required, Non-nullable]
  - `status`: `enum` [`DRAFT`, `ACTIVE`, `SUSPENDED`, `RETIRED`] [Required, Default: `DRAFT`]
  - `tier`: `enum` [`COMMUNITY`, `ENTERPRISE`, `MISSION_CRITICAL`] [Required, Default: `ENTERPRISE`]
  - `isolation_level`: `enum` [`SHARED_POOL`, `DEDICATED_VIRTUAL`, `AIR_GAPPED`] [Required, Default: `DEDICATED_VIRTUAL`]
  - `contact_email`: `string` (email) [Required, Non-nullable]
  - `metadata`: `object` (key-value strings) [Optional, Default: `{}`]
  - `temporal_header`: `BitemporalInterval` [Required]
- **Lifecycle Applicability:** Draft -> Active <-> Suspended -> Retired.
- **Deletion Behavior:** Soft deletion; cascade suspension to child workspaces and Nests.

---

### 2.2 Workspace (`ENT-WSP`)
- **Business Purpose:** Sub-tenant boundary within an Organization for team isolation, billing sub-units, or geographic divisions.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `code`: `string` (Alpha-numeric slug, 2-32 chars) [Required, Non-nullable, Unique within `org_id`]
  - `name`: `string` (1-128 chars) [Required, Non-nullable]
  - `status`: `enum` [`DRAFT`, `ACTIVE`, `SUSPENDED`, `RETIRED`] [Required, Default: `DRAFT`]
  - `max_nests`: `integer` (min: 1, max: 1000) [Required, Default: 50]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.3 Nest (`ENT-NST`)
- **Business Purpose:** A cluster or execution boundary that aggregates multiple PingoNodes under common policy, network zone, and failover constraints.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `workspace_id`: `string` (FK to Workspace) [Required, Non-nullable]
  - `nest_name`: `string` (1-128 chars) [Required, Non-nullable]
  - `environment`: `enum` [`DEVELOPMENT`, `STAGING`, `PRODUCTION`, `DISASTER_RECOVERY`] [Required]
  - `status`: `enum` [`PROVISIONING`, `ACTIVE`, `DRAINING`, `DECOMMISSIONED`] [Required, Default: `PROVISIONING`]
  - `heartbeat_interval_sec`: `integer` (min: 1, max: 3600) [Required, Default: 30]
  - `quorum_policy`: `enum` [`SINGLETON`, `MAJORITY_QUORUM`, `CONSENSUS_STRICT`] [Required, Default: `MAJORITY_QUORUM`]
  - `tags`: `array<string>` [Optional, Default: `[]`]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.4 PingoNode (`ENT-NOD`)
- **Business Purpose:** A registered computational endpoint, microservice agent, sensor, or execution node belonging to a single Nest.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `nest_id`: `string` (FK to Nest) [Required, Non-nullable]
  - `node_key`: `string` (Hardware/Instance fingerprint or unique identifier) [Required, Unique within Nest]
  - `hostname`: `string` (DNS/FQDN format) [Required]
  - `status`: `enum` [`REGISTERED`, `INITIALIZING`, `HEALTHY`, `DEGRADED`, `OFFLINE`, `REVOKED`] [Required, Default: `REGISTERED`]
  - `ip_address`: `string` (IPv4 or IPv6) [Required]
  - `firmware_or_runtime_version`: `string` (SemVer) [Required]
  - `last_heartbeat_at`: `string` (ISO8601 UTC) [Optional]
  - `resource_metrics`: `object` (`cpu_cores`, `memory_mb`, `storage_gb`) [Optional]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.5 Subject (`ENT-SBJ`)
- **Business Purpose:** A legal person, human operator, service principal, or automated autonomous agent acting within the system.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `principal_type`: `enum` [`HUMAN_OPERATOR`, `SERVICE_PRINCIPAL`, `SYSTEM_DAEMON`] [Required]
  - `identifier_handle`: `string` (e.g., username or email) [Required, Unique within `org_id`]
  - `status`: `enum` [`PENDING_INVITE`, `ACTIVE`, `SUSPENDED`, `REVOKED`] [Required, Default: `ACTIVE`]
  - `security_clearance`: `enum` [`STANDARD`, `CONFIDENTIAL`, `RESTRICTED`] [Required, Default: `STANDARD`]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.6 RoleDefinition (`ENT-ROL`)
- **Business Purpose:** A declared, cataloged set of permissions without assignment. Pure authorization definition.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization or `urn:pingo:global` for System Roles) [Required]
  - `role_name`: `string` (Alpha-numeric snake_case, 3-64 chars) [Required]
  - `description`: `string` (Max 500 chars) [Required]
  - `permissions`: `array<string>` (Format: `resource:action`, e.g., `nest:create`, `pingo:reboot`) [Required, minItems: 1]
  - `is_system_role`: `boolean` [Required, Default: `false`]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.7 RoleGrant (`ENT-RGR`)
- **Business Purpose:** The explicit assignment of a `RoleDefinition` to a `Subject` scoped to an entity hierarchy (Org, Workspace, Nest, or Node).
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `subject_id`: `string` (FK to Subject) [Required, Non-nullable]
  - `role_id`: `string` (FK to RoleDefinition) [Required, Non-nullable]
  - `scope_type`: `enum` [`GLOBAL`, `ORGANIZATION`, `WORKSPACE`, `NEST`, `PINGO_NODE`] [Required]
  - `scope_target_id`: `string` (FK to corresponding entity ID) [Required]
  - `granted_by`: `string` (FK to Subject ID who authorized grant) [Required]
  - `is_revoked`: `boolean` [Required, Default: `false`]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.8 GovernancePolicy (`ENT-POL`)
- **Business Purpose:** Rules that govern operational safety, Separation of Duties (SoD), change windows, and dual-authorization constraints.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `policy_code`: `string` (e.g., `SOD-PROD-REBOOT`, `POL-DUAL-KEY-01`) [Required, Unique within Org]
  - `policy_type`: `enum` [`SEPARATION_OF_DUTIES`, `MANDATORY_APPROVAL`, `TIME_WINDOW_RESTRICTION`, `QUORUM_ENFORCEMENT`] [Required]
  - `enforcement_level`: `enum` [`HARD_STOP`, `AUDIT_ALERT_ONLY`] [Required, Default: `HARD_STOP`]
  - `rules_expression`: `object` (Structured AST of conditions and conflicting roles) [Required]
  - `status`: `enum` [`DRAFT`, `ENFORCED`, `SUSPENDED`, `DEPRECATED`] [Required, Default: `DRAFT`]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.9 ApprovalRequest (`ENT-APR`)
- **Business Purpose:** Formal dual-custody or multi-signature workflow ticket required prior to executing restricted or governance-regulated operations.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `policy_id`: `string` (FK to GovernancePolicy) [Required, Non-nullable]
  - `requester_subject_id`: `string` (FK to Subject) [Required, Non-nullable]
  - `target_resource_id`: `string` (Target entity URN) [Required, Non-nullable]
  - `action`: `string` (e.g., `nest:decommission`, `policy:override`) [Required]
  - `payload_preview`: `object` (Diff/Parameters of requested operation) [Required]
  - `approver_subject_ids`: `array<string>` [Required, Default: `[]`]
  - `status`: `enum` [`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED`] [Required, Default: `PENDING`]
  - `expires_at`: `string` (ISO8601 UTC) [Required]
  - `temporal_header`: `BitemporalInterval` [Required]

---

### 2.10 AuditTransactionRecord (`ENT-AUD`)
- **Business Purpose:** Immutable, tamper-evident cryptographic ledger record documenting every state mutation, authorization evaluation, and governance enforcement.
- **Primary Identifier:** `id` (URN UUIDv4)
- **Fields:**
  - `id`: `string` (Format: UUID/URN) [Required, Non-nullable, Unique]
  - `sequence_number`: `integer` (Monotonically increasing per tenant ledger) [Required, Non-nullable]
  - `org_id`: `string` (FK to Organization) [Required, Non-nullable]
  - `actor_subject_id`: `string` (FK to Subject or `urn:pingo:system`) [Required]
  - `operation_class`: `enum` [`CREATE`, `UPDATE`, `TRANSITION`, `DELETE_SOFT`, `AUTH_PERMIT`, `AUTH_DENY`, `POLICY_VETO`] [Required]
  - `target_entity_type`: `string` [Required]
  - `target_entity_id`: `string` [Required]
  - `pre_state_hash`: `string` (SHA-256 hex or `GENESIS_HASH`) [Required]
  - `post_state_hash`: `string` (SHA-256 hex) [Required]
  - `previous_audit_entry_hash`: `string` (SHA-256 hex) [Required]
  - `entry_signature_hash`: `string` (SHA-256 hash of entire record payload) [Required]
  - `client_metadata`: `object` (`ip`, `user_agent`, `request_id`, `correlation_id`) [Required]
  - `recorded_at`: `string` (ISO8601 UTC) [Required]
