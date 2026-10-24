# PingoNest ST1 — Production Implementation & Engineering Roadmap
**Document Identifier:** `ARCH-PROD-ST1-011`  
**Classification:** `Production Engineering Blueprint`  

---

## 1. Production High-Level Architecture

To turn the PingoNest ST1 architectural baseline into an enterprise production software system:

```
                                  +---------------------------------------+
                                  |   Web UI / CLI Operator Dashboard     |
                                  |  (React / Vite + Admin Control Plane) |
                                  +-------------------+-------------------+
                                                      | HTTPS / WSS
                                                      v
                                  +---------------------------------------+
                                  |      PingoNest Control Plane API      |
                                  |       (Go / Rust / Node.js)           |
                                  +---------+-------------------+---------+
                                            |                   |
            +-------------------------------+                   +-------------------------------+
            |                                                                                   |
            v                                                                                   v
+-----------------------+                                                           +-----------------------+
|  IAM & Governance     |                                                           |  Audit & Provenance   |
|  - 8-Step Pipeline    |                                                           |  - SHA-256 Chaining   |
|  - SoD Mutex Veto     |                                                           |  - Append-Only Store  |
|  - Dual Approval Gate |                                                           |  - Tamper Detection   |
+-----------+-----------+                                                           +-----------+-----------+
            |                                                                                   |
            +-----------------------------------+-----------------------------------------------+
                                                |
                                                v
                              +-----------------------------------+
                              |     Relational System of Record   |
                              |    (PostgreSQL 16 + Bitemporal)   |
                              +-----------------+-----------------+
                                                |
                                                | mTLS / gRPC Bidirectional Stream
                                                v
                              +-----------------------------------+
                              |       Edge Pingo Nodes (Fleet)    |
                              |   Node Agent Daemon (`pingod`)    |
                              |   - 15s Heartbeat Ping            |
                              |   - CPU / RAM / Disk Telemetry    |
                              |   - Workload Execution Sandbox    |
                              +-----------------------------------+
```

---

## 2. Core Implementation Components

### A. The Control Plane Service (`pingonest-server`)
- **Language / Framework:** Go, Rust, or TypeScript (Node.js/Express)
- **Core Interfaces:**
  - `POST /api/v1/nodes/heartbeat`: Ingests node telemetry with mTLS attestation.
  - `POST /api/v1/nests/:id/actions`: Evaluates 8-step authorization before dispatching commands.
  - `POST /api/v1/approvals/:id/co-sign`: Enforces dual-custody approval quorum.
- **Transaction Engine:** Performs ACID transactions wrapping entity mutations and audit records simultaneously.

### B. The Node Daemon (`pingod`)
- **Footprint:** Single static binary (<15MB), zero external runtime dependencies.
- **Responsibilities:**
  - Hardware fingerprinting (`node_key` generation).
  - Secure TLS 1.3 mutual authentication with Nest cluster endpoint.
  - Heartbeat beaconing every 15 seconds.
  - Execution of dispatched containerized tasks or microservice processes.

### C. The Relational System of Record (PostgreSQL Schema)
- Tables for `organizations`, `workspaces`, `nests`, `nodes`, `subjects`, `roles`, `grants`, `policies`, `approval_requests`, and `audit_ledger`.
- Bitemporal columns: `effective_from TIMESTAMP WITH TIME ZONE`, `effective_to TIMESTAMP WITH TIME ZONE`, `recorded_at TIMESTAMP WITH TIME ZONE`.
- Check constraints: `CHECK (effective_from <= effective_to)`.
- Foreign key constraints: `ON DELETE RESTRICT` (hard deletes rejected at database level).

---

## 3. Step-by-Step Production Roadmap

1. **Phase 1: Database Migration & ORM Setup**
   - Provision PostgreSQL database.
   - Run DDL migrations mapping all 10 entities from the canonical entity dictionary.
2. **Phase 2: Core Control Plane API Implementation**
   - Mount 8-step authorization middleware (`evaluateAuthorization`).
   - Mount governance veto interceptor for dual-custody approval gates.
   - Mount SHA-256 audit chaining transaction hook on all SQL write operations.
3. **Phase 3: Node Agent & Telemetry Pipeline**
   - Compile `pingod` agent binary.
   - Deploy daemon on edge worker nodes / VMs.
   - Implement WebSocket / gRPC stream for sub-second status reflection.
4. **Phase 4: Multi-Tenant RBAC & SSO Integration**
   - Integrate SAML 2.0 / OIDC provider (Google Workspace, Okta, Azure AD) for Subject authentication.
   - Enforce automated role assignment policies.
5. **Phase 5: High Availability & Security Hardening**
   - Deploy Control Plane behind load balancers with active-passive failover.
   - Cold storage backup of cryptographic audit ledger to immutable WORM (Write Once, Read Many) cloud bucket.
