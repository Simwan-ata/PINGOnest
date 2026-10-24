/**
 * PingoNest ST1 Automated Test Suite & Red-Team Verification Harness
 */
import { VALID_BASELINE_BUNDLE } from '../domain/sampleData';
import { validateBundle } from './validator';
import { evaluateAuthorization } from '../domain/authorization';
import { validateStateTransition, ORG_TRANSITIONS, NEST_TRANSITIONS } from '../domain/lifecycle';
import { validateApprovalSubmission, evaluateSeparationOfDuties } from '../domain/governance';

export interface TestCaseResult {
  id: string;
  category: 'STRUCTURAL' | 'SEMANTIC' | 'LIFECYCLE' | 'TEMPORAL' | 'SECURITY' | 'GOVERNANCE' | 'AUDIT';
  name: string;
  description: string;
  status: 'PASSED' | 'FAILED';
  expected: string;
  actual: string;
  durationMs: number;
  errorDetails?: string;
}

export function runFullTestSuite(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  const runTest = (
    id: string,
    category: TestCaseResult['category'],
    name: string,
    description: string,
    expected: string,
    fn: () => { passed: boolean; actual: string; details?: string }
  ) => {
    const start = performance.now();
    try {
      const res = fn();
      const end = performance.now();
      results.push({
        id,
        category,
        name,
        description,
        status: res.passed ? 'PASSED' : 'FAILED',
        expected,
        actual: res.actual,
        durationMs: Math.round((end - start) * 100) / 100,
        errorDetails: res.details
      });
    } catch (err: any) {
      const end = performance.now();
      results.push({
        id,
        category,
        name,
        description,
        status: 'FAILED',
        expected,
        actual: `Exception thrown: ${err.message}`,
        durationMs: Math.round((end - start) * 100) / 100,
        errorDetails: err.stack
      });
    }
  };

  // 1. Structural Schema Tests
  runTest(
    'TEST-STR-001',
    'STRUCTURAL',
    'Valid Baseline Conformance',
    'Canonical baseline bundle must satisfy 100% of JSON Schema and semantic rules without errors',
    'isValid = true, totalErrors = 0',
    () => {
      const report = validateBundle(VALID_BASELINE_BUNDLE);
      return {
        passed: report.isValid && report.totalErrors === 0,
        actual: `isValid=${report.isValid}, totalErrors=${report.totalErrors}`,
        details: report.issues.map((i) => i.message).join('; ')
      };
    }
  );

  runTest(
    'TEST-STR-002',
    'STRUCTURAL',
    'Missing Required Field Rejection',
    'Removing required display_name from Organization must fail JSON Schema validation',
    'Schema error for missing display_name',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      delete mutated.organizations[0].display_name;
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.layer === 'STRUCTURAL_SCHEMA' && i.message.includes('display_name'));
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Schema caught missing display_name' : 'Failed to catch missing field'
      };
    }
  );

  runTest(
    'TEST-STR-003',
    'STRUCTURAL',
    'Invalid URN UUID Identifier',
    'Malformed URN identifier (not UUIDv4 pattern) must be rejected',
    'Pattern mismatch error on URN identifier',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.organizations[0].id = 'invalid:plain-text-id';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.layer === 'STRUCTURAL_SCHEMA' && i.ruleCode.includes('PATTERN'));
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Rejected invalid URN format' : 'Permitted invalid URN'
      };
    }
  );

  runTest(
    'TEST-STR-004',
    'STRUCTURAL',
    'Invalid Status Enum Rejection',
    'Assigning non-existent enum value to status must be rejected',
    'Enum validation failure for status',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.organizations[0].status = 'INVALID_UNKNOWN_STATUS';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode.includes('ENUM'));
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Rejected disallowed enum value' : 'Disallowed enum value accepted'
      };
    }
  );

  // 2. Semantic Referential Integrity Tests
  runTest(
    'TEST-SEM-001',
    'SEMANTIC',
    'Orphan Workspace Reference Detection',
    'Workspace referencing non-existent Organization ID must be flagged as fatal error',
    'REF_ORPHAN_WORKSPACE error detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.workspaces[0].org_id = 'urn:pingo:org:00000000-0000-4000-8000-000000000000';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'REF_ORPHAN_WORKSPACE');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Caught orphan workspace reference' : 'Failed to detect orphan reference'
      };
    }
  );

  runTest(
    'TEST-SEM-002',
    'SEMANTIC',
    'Orphan Nest Reference Detection',
    'Nest referencing non-existent Workspace ID must be flagged',
    'REF_ORPHAN_NEST_WSP error detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.nests[0].workspace_id = 'urn:pingo:wsp:00000000-0000-4000-8000-000000000000';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'REF_ORPHAN_NEST_WSP');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Caught orphan nest reference' : 'Failed to detect orphan nest'
      };
    }
  );

  runTest(
    'TEST-SEM-003',
    'SEMANTIC',
    'Orphan PingoNode Reference Detection',
    'PingoNode referencing non-existent Nest ID must be flagged',
    'REF_ORPHAN_NODE error detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.nodes[0].nest_id = 'urn:pingo:nest:00000000-0000-4000-8000-000000000000';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'REF_ORPHAN_NODE');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Caught orphan node reference' : 'Failed to detect orphan node'
      };
    }
  );

  // 3. Lifecycle & FSM Tests
  runTest(
    'TEST-LIF-001',
    'LIFECYCLE',
    'Prohibited Direct Organization Deletion',
    'Transitioning Organization from DRAFT directly to RETIRED must be prohibited',
    'valid = false, Prohibited by lifecycle FSM',
    () => {
      const res = validateStateTransition(ORG_TRANSITIONS, 'DRAFT', 'RETIRED');
      return {
        passed: !res.valid,
        actual: res.reason || 'Transition permitted'
      };
    }
  );

  runTest(
    'TEST-LIF-002',
    'LIFECYCLE',
    'Organization Activation Precondition Guard',
    'Organization transition from DRAFT to ACTIVE requires active admin subject',
    'Blocked if activeAdminCount < 1; Allowed if activeAdminCount >= 1',
    () => {
      const blocked = validateStateTransition(ORG_TRANSITIONS, 'DRAFT', 'ACTIVE', { activeAdminCount: 0 });
      const allowed = validateStateTransition(ORG_TRANSITIONS, 'DRAFT', 'ACTIVE', { activeAdminCount: 1 });
      const passed = !blocked.valid && allowed.valid;
      return {
        passed,
        actual: `NoAdmin: valid=${blocked.valid}; WithAdmin: valid=${allowed.valid}`
      };
    }
  );

  runTest(
    'TEST-LIF-003',
    'LIFECYCLE',
    'Terminal Entity Modification Guard',
    'Mutating operation on DECOMMISSIONED Nest must be rejected',
    'DENY with RESOURCE_TERMINAL_STATE',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.nests[0].status = 'DECOMMISSIONED';
      const evalRes = evaluateAuthorization(
        mutated.subjects[0].id,
        'nest:reboot',
        mutated.nests[0].id,
        mutated.organizations[0].id,
        mutated
      );
      return {
        passed: evalRes.decision === 'DENY' && evalRes.reasonCode === 'RESOURCE_TERMINAL_STATE',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  // 4. Temporal Tests
  runTest(
    'TEST-TMP-001',
    'TEMPORAL',
    'Inverted Bitemporal Interval Detection',
    'effective_from timestamp greater than effective_to must be rejected',
    'TEMPORAL_INVERTED_INTERVAL detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.organizations[0].temporal_header.effective_from = '2027-01-01T00:00:00.000Z';
      mutated.organizations[0].temporal_header.effective_to = '2026-01-01T00:00:00.000Z';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'TEMPORAL_INVERTED_INTERVAL');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Caught inverted temporal interval' : 'Allowed inverted interval'
      };
    }
  );

  runTest(
    'TEST-TMP-002',
    'TEMPORAL',
    'Expired RoleGrant Enforcement',
    'RoleGrant evaluated past its effective_to window must result in DENY',
    'DENY (PERMISSION_NOT_GRANTED / NO_ACTIVE_GRANTS)',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      // Set grant effective_to in the past
      mutated.grants[0].temporal_header.effective_to = '2026-06-01T00:00:00.000Z';
      const evalRes = evaluateAuthorization(
        mutated.subjects[0].id,
        'nest:reboot',
        mutated.nests[0].id,
        mutated.organizations[0].id,
        mutated,
        { currentTime: '2026-10-18T22:00:00.000Z' }
      );
      return {
        passed: evalRes.decision === 'DENY',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  // 5. Security & Authorization Tests
  runTest(
    'TEST-SEC-001',
    'SECURITY',
    'Cross-Tenant Boundary Isolation',
    'Subject from Tenant A attempting operation on Tenant B resource must be DENIED',
    'DENY (CROSS_TENANT_VIOLATION)',
    () => {
      const foreignOrgId = 'urn:pingo:org:99998888-7777-4666-8555-444433332222';
      const evalRes = evaluateAuthorization(
        VALID_BASELINE_BUNDLE.subjects[0].id,
        'nest:read',
        VALID_BASELINE_BUNDLE.nests[0].id,
        foreignOrgId,
        VALID_BASELINE_BUNDLE
      );
      return {
        passed: evalRes.decision === 'DENY' && evalRes.reasonCode === 'CROSS_TENANT_VIOLATION',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  runTest(
    'TEST-SEC-002',
    'SECURITY',
    'Default-Deny Access Enforcement',
    'Subject with no grants for an unassigned action must receive DENY',
    'DENY (PERMISSION_NOT_GRANTED)',
    () => {
      // Bob is in bundle but has no grants
      const evalRes = evaluateAuthorization(
        VALID_BASELINE_BUNDLE.subjects[1].id,
        'nest:delete',
        VALID_BASELINE_BUNDLE.nests[0].id,
        VALID_BASELINE_BUNDLE.organizations[0].id,
        VALID_BASELINE_BUNDLE
      );
      return {
        passed: evalRes.decision === 'DENY',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  runTest(
    'TEST-SEC-003',
    'SECURITY',
    'Suspended Subject Fail-Closed',
    'Suspended subject must be denied immediately regardless of role grants',
    'DENY (SUBJECT_INACTIVE)',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.subjects[0].status = 'SUSPENDED';
      const evalRes = evaluateAuthorization(
        mutated.subjects[0].id,
        'nest:reboot',
        mutated.nests[0].id,
        mutated.organizations[0].id,
        mutated
      );
      return {
        passed: evalRes.decision === 'DENY' && evalRes.reasonCode === 'SUBJECT_INACTIVE',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  runTest(
    'TEST-SEC-004',
    'SECURITY',
    'Hierarchical Scope Coverage Verification',
    'Grant with ORGANIZATION scope must cover child Nest and PingoNode',
    'PERMIT (AUTHORIZED_BY_GRANT)',
    () => {
      const evalRes = evaluateAuthorization(
        VALID_BASELINE_BUNDLE.subjects[0].id,
        'nest:reboot',
        VALID_BASELINE_BUNDLE.nests[0].id,
        VALID_BASELINE_BUNDLE.organizations[0].id,
        VALID_BASELINE_BUNDLE
      );
      return {
        passed: evalRes.decision === 'PERMIT',
        actual: `${evalRes.decision} (${evalRes.reasonCode})`
      };
    }
  );

  // 6. Governance & Separation of Duties Tests
  runTest(
    'TEST-GOV-001',
    'GOVERNANCE',
    'Separation of Duties (SoD) Hard Stop',
    'User assigned conflicting roles (cluster_admin + compliance_auditor) must be vetoed',
    'allowed = false with SOD_CONFLICTING_ROLES',
    () => {
      const res = evaluateSeparationOfDuties(
        VALID_BASELINE_BUNDLE.subjects[0].id,
        [VALID_BASELINE_BUNDLE.roles[0].id, VALID_BASELINE_BUNDLE.roles[1].id],
        VALID_BASELINE_BUNDLE
      );
      return {
        passed: !res.allowed && res.violationCode === 'SOD_CONFLICTING_ROLES',
        actual: `allowed=${res.allowed}, code=${res.violationCode}`
      };
    }
  );

  runTest(
    'TEST-GOV-002',
    'GOVERNANCE',
    'Dual-Custody Self-Approval Prohibited',
    'Approval request where requester is in approver_subject_ids must be rejected',
    'allowed = false with SOD_SELF_APPROVAL_PROHIBITED',
    () => {
      const selfApproval = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE.approval_requests[0]));
      selfApproval.approver_subject_ids = [selfApproval.requester_subject_id];
      const res = validateApprovalSubmission(selfApproval, VALID_BASELINE_BUNDLE);
      return {
        passed: !res.allowed && res.violationCode === 'SOD_SELF_APPROVAL_PROHIBITED',
        actual: `allowed=${res.allowed}, code=${res.violationCode}`
      };
    }
  );

  // 7. Audit Ledger Cryptographic Integrity Tests
  runTest(
    'TEST-AUD-001',
    'AUDIT',
    'Cryptographic Audit Hash Chain Verification',
    'Tampering with an audit entry previous_hash must be detected',
    'AUDIT_CHAIN_BROKEN_HASH detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.audit_records[1].previous_audit_entry_hash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'AUDIT_CHAIN_BROKEN_HASH');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Detected cryptographic tampering' : 'Failed to detect tampered audit chain'
      };
    }
  );

  runTest(
    'TEST-AUD-002',
    'AUDIT',
    'Monotonic Sequence Number Enforcement',
    'Audit record sequence number gap or duplicate must be flagged as non-monotonic',
    'AUDIT_SEQUENCE_NON_MONOTONIC detected',
    () => {
      const mutated = JSON.parse(JSON.stringify(VALID_BASELINE_BUNDLE));
      mutated.audit_records[1].sequence_number = 5; // expected 2
      const report = validateBundle(mutated);
      const caught = report.issues.some((i) => i.ruleCode === 'AUDIT_SEQUENCE_NON_MONOTONIC');
      return {
        passed: !report.isValid && caught,
        actual: caught ? 'Detected non-monotonic sequence' : 'Permitted non-monotonic sequence'
      };
    }
  );

  return results;
}
