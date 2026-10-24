/**
 * ST1 Architectural Bridge for PingoNest Pro
 * Compiles the visual Org Chart & BPMN processes into a canonical PingoNest ST1 Bundle
 * adhering strictly to the Greenfield domain types, JSON Schema, and 8-Step Auth.
 */
import { PersonNode, BpmnProcess } from '../types/pingonest';
import {
  PingoNestBundle,
  Subject,
  RoleGrant,
  RoleDefinition,
  Organization,
  Workspace,
  Nest,
  GovernancePolicy,
  BitemporalInterval,
  AuditTransactionRecord
} from '../domain/types';
import { validateBundle, ComprehensiveValidationReport } from '../validation/validator';
import { computeSha256 } from '../domain/crypto';

export function bridgeToSt1Bundle(
  orgName: string,
  people: PersonNode[],
  processes: BpmnProcess[]
): { bundle: PingoNestBundle; validationReport: ComprehensiveValidationReport } {
  const orgUuid = '11111111-1111-4111-8111-111111111111';
  const orgUrn = `urn:pingo:org:${orgUuid}`;
  const recordedBySubjectId = 'urn:pingo:sbj:99999999-9999-4999-8999-999999999999';
  const now = new Date().toISOString();

  const createTemporalHeader = (): BitemporalInterval => ({
    effective_from: '2026-01-01T00:00:00.000Z',
    effective_to: '9999-12-31T23:59:59.999Z',
    recorded_at: now,
    recorded_by_subject_id: recordedBySubjectId,
    supersedes_record_id: null,
    is_current_valid_snapshot: true
  });

  // Root Organization
  const org: Organization = {
    id: orgUrn,
    slug: 'apex-cybertech',
    display_name: orgName || 'Apex CyberTech Global',
    status: 'ACTIVE',
    tier: 'ENTERPRISE',
    isolation_level: 'DEDICATED_VIRTUAL',
    contact_email: 'security@apexcyber.example',
    metadata: {
      region: 'us-east-1',
      framework: 'SOC2-TYPE-II'
    },
    temporal_header: createTemporalHeader()
  };

  // Departments as Workspaces
  const depts = Array.from(new Set(people.map((p) => p.department)));
  const workspaces: Workspace[] = depts.map((d, idx) => {
    const pad = String(idx + 1).padStart(12, '0');
    return {
      id: `urn:pingo:wsp:22222222-2222-4222-8222-${pad}`,
      org_id: orgUrn,
      code: `wsp-${idx + 1}`,
      name: d,
      status: 'ACTIVE',
      max_nests: 20,
      temporal_header: createTemporalHeader()
    };
  });

  const wspMap = new Map(depts.map((d, i) => [d, workspaces[i].id]));

  // Nests
  const nests: Nest[] = workspaces.map((w, idx) => {
    const pad = String(idx + 1).padStart(12, '0');
    return {
      id: `urn:pingo:nest:33333333-3333-4333-8333-${pad}`,
      org_id: orgUrn,
      workspace_id: w.id,
      nest_name: `nest-${w.code}`,
      environment: 'PRODUCTION',
      status: 'ACTIVE',
      heartbeat_interval_sec: 15,
      quorum_policy: 'MAJORITY_QUORUM',
      tags: ['production', 'pingo-st1'],
      temporal_header: createTemporalHeader()
    };
  });

  // Subjects
  const subjects: Subject[] = people.map((p, idx) => {
    const pad = String(idx + 1).padStart(12, '0');
    return {
      id: `urn:pingo:sbj:99999999-9999-4999-8999-${pad}`,
      org_id: orgUrn,
      principal_type: 'HUMAN_OPERATOR',
      identifier_handle: p.email || `user.${p.id}@apexcyber.example`,
      status: p.status === 'فعال' || p.status === 'Active' ? 'ACTIVE' : 'SUSPENDED',
      security_clearance: !p.parentId ? 'RESTRICTED' : p.subCount > 0 ? 'CONFIDENTIAL' : 'STANDARD',
      temporal_header: createTemporalHeader()
    };
  });

  // Roles
  const roles: RoleDefinition[] = [
    {
      id: 'urn:pingo:role:aaaa1111-1111-4aaa-8aaa-111111111111',
      org_id: orgUrn,
      role_name: 'cluster_admin',
      description: 'مدیریت ارشد کلاستر سازمانی با دسترسی کامل',
      permissions: ['*'],
      is_system_role: true,
      temporal_header: createTemporalHeader()
    },
    {
      id: 'urn:pingo:role:aaaa2222-2222-4aaa-8aaa-222222222222',
      org_id: orgUrn,
      role_name: 'compliance_auditor',
      description: 'حسابرس انطباق فرآیندی و مشاهده اسناد',
      permissions: ['audit:read', 'workspace:read', 'policy:verify'],
      is_system_role: false,
      temporal_header: createTemporalHeader()
    },
    {
      id: 'urn:pingo:role:aaaa3333-3333-4aaa-8aaa-333333333333',
      org_id: orgUrn,
      role_name: 'operator',
      description: 'مجری عملیات فنی و اجرای وظایف',
      permissions: ['workspace:read', 'workspace:write', 'nest:manage'],
      is_system_role: false,
      temporal_header: createTemporalHeader()
    }
  ];

  // Grants
  const grants: RoleGrant[] = people.map((p, idx) => {
    const pad = String(idx + 1).padStart(12, '0');
    const isTop = !p.parentId;
    const isManager = p.subCount > 0;
    const roleId = isTop
      ? roles[0].id
      : isManager
      ? roles[1].id
      : roles[2].id;

    return {
      id: `urn:pingo:grant:bbbb1111-1111-4bbb-8bbb-${pad}`,
      subject_id: subjects[idx].id,
      role_id: roleId,
      scope_type: isTop ? 'ORGANIZATION' : 'WORKSPACE',
      scope_target_id: isTop ? orgUrn : (wspMap.get(p.department) || workspaces[0].id),
      granted_by: recordedBySubjectId,
      is_revoked: false,
      temporal_header: createTemporalHeader()
    };
  });

  // Governance Policies
  const policies: GovernancePolicy[] = processes.map((proc, idx) => {
    const pad = String(idx + 1).padStart(12, '0');
    return {
      id: `urn:pingo:pol:cccc1111-1111-4ccc-8ccc-${pad}`,
      org_id: orgUrn,
      policy_code: `SOD-BPMN-${idx + 1}`,
      policy_type: 'SEPARATION_OF_DUTIES',
      enforcement_level: 'HARD_STOP',
      rules_expression: {
        mutex_roles: ['cluster_admin', 'compliance_auditor'],
        process_name: proc.name
      },
      status: 'ENFORCED',
      temporal_header: createTemporalHeader()
    };
  });

  // Audit Records
  const auditRecords: AuditTransactionRecord[] = [
    {
      id: 'urn:pingo:aud:dddd1111-1111-4ddd-8ddd-000000000001',
      sequence_number: 1,
      org_id: orgUrn,
      actor_subject_id: subjects[0]?.id || recordedBySubjectId,
      operation_class: 'CREATE',
      target_entity_type: 'ORGANIZATION',
      target_entity_id: orgUrn,
      pre_state_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      post_state_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      previous_audit_entry_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      entry_signature_hash: 'sig_a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      client_metadata: { source: 'PingoNest-Pro-Compiler' },
      recorded_at: now
    }
  ];

  const bundle: PingoNestBundle = {
    version: '1.0.0-st1',
    generated_at: now,
    organizations: [org],
    workspaces,
    nests,
    nodes: [],
    subjects,
    roles,
    grants,
    policies,
    approval_requests: [],
    audit_records: auditRecords
  };

  const validationReport = validateBundle(bundle);

  return { bundle, validationReport };
}
