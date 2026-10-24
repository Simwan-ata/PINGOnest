# PingoNest ST1 — Identity and Authorization Contract
**Document Identifier:** `ARCH-AUTH-ST1-005`  
**Version:** `1.0.0-PROPOSED`  
**Status:** `DRAFT / UNDER REVIEW (GATE 2)`  
**Baseline Mode:** `Greenfield Architecture Baseline`  
**Classification:** `Security Architecture Specification`  

---

## 1. Distinct Identity & Authorization Concepts

To prevent architectural ambiguity, PingoNest ST1 strictly bifurcates identity and access constructs:

1. **Human/System Principal (`Subject`):** The legal identity entity (e.g., Alice Smith or Automated Deployment Worker).
2. **Authentication Credential (`Account`):** Secrets, API tokens, mTLS certificates, or SSO mappings used to authenticate a Subject.
3. **Role Definition (`RoleDefinition`):** Cataloged bundle of permissions (e.g., `nest:create`, `pingo:read`, `pingo:reboot`). Roles hold zero identity data.
4. **Role Grant (`RoleGrant`):** A temporal binding associating `Subject + RoleDefinition + Scope`.
5. **Scope Hierarchy (`ScopeRegistry`):** The boundary in which a grant is valid (`GLOBAL` -> `ORGANIZATION` -> `WORKSPACE` -> `NEST` -> `PINGO_NODE`).
6. **Governance Constraint (`GovernancePolicy`):** Independent business rules (e.g., Separation of Duties, dual custody) that can veto a role grant.
7. **Authorization Decision:** Runtime evaluation yielding `PERMIT` or `DENY` with auditable reason code.

---

## 2. Canonical Authorization Evaluation Pipeline

Every inbound operation executes the following deterministic 8-step decision algorithm:

```
[Inbound Request: (Subject, Action, TargetResource, Context)]
                       |
                       v
         [Step 1: Check Principal Status]
      (Is Subject ACTIVE? Account not locked?)
          | NO                          | YES
          v                             v
     [DENY 401/403]        [Step 2: Cross-Tenant Check]
                    (Target Org == Subject Org or Global?)
                                        | NO            | YES
                                        v               v
                                   [DENY 403]   [Step 3: Temporal Grant Window]
                                                (Is current_time in [eff_from, eff_to]?)
                                                        | NO            | YES
                                                        v               v
                                                   [DENY 403]   [Step 4: Scope Inclusion]
                                                                (Grant Scope covers Target Resource?)
                                                                        | NO            | YES
                                                                        v               v
                                                                   [DENY 403]   [Step 5: Permission Match]
                                                                                (Role contains requested action?)
                                                                                        | NO            | YES
                                                                                        v               v
                                                                                   [DENY 403]   [Step 6: Governance Policy Veto]
                                                                                                (SoD conflict? Dual approval required?)
                                                                                                        | VETOED        | PASSED
                                                                                                        v               v
                                                                                                   [DENY 403]   [Step 7: Resource Lifecycle]
                                                                                                                (Target resource not DECOMMISSIONED?)
                                                                                                                        | NO            | YES
                                                                                                                        v               v
                                                                                                                   [DENY 403]      [PERMIT 200]
                                                                                                                        \               /
                                                                                                                [Step 8: Write Audit Ledger]
```

---

## 3. Security Invariants
- **INV-AUTH-01 (Default-Deny):** In the absence of an explicit valid grant matching scope and action, access is unconditionally denied.
- **INV-AUTH-02 (Tenant Partition Isolation):** A subject belonging to Organization A cannot access resources in Organization B unless explicit federated guest grant exists.
- **INV-AUTH-03 (Separation of Duties - SoD):** A Subject holding the `Operator` role on a Nest cannot approve their own `ApprovalRequest` to decommission that Nest (Self-Approval Prohibited).
- **INV-AUTH-04 (Fail-Closed):** Any exception during policy parsing, network lookup, or ledger generation causes the transaction to fail closed (`DENY`).
