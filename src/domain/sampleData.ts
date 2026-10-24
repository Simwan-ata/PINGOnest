/**
 * PingoNest ST1 Canonical Baseline Sample Data & Test Fixtures
 */
import { PingoNestBundle } from './types';

export const VALID_BASELINE_BUNDLE: PingoNestBundle = {
  version: "1.0.0-st1",
  generated_at: "2026-10-18T22:00:00.000Z",
  organizations: [
    {
      id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      slug: "apex-cybertech",
      display_name: "Apex CyberTech Global",
      status: "ACTIVE",
      tier: "MISSION_CRITICAL",
      isolation_level: "DEDICATED_VIRTUAL",
      contact_email: "security@apexcyber.example",
      metadata: {
        region: "us-east-1",
        regulatory_framework: "SOC2-TYPE-II"
      },
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  workspaces: [
    {
      id: "urn:pingo:wsp:22222222-2222-4222-8222-222222222222",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      code: "core-workloads",
      name: "Core Infrastructure Workloads",
      status: "ACTIVE",
      max_nests: 50,
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  nests: [
    {
      id: "urn:pingo:nest:33333333-3333-4333-8333-333333333333",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      workspace_id: "urn:pingo:wsp:22222222-2222-4222-8222-222222222222",
      nest_name: "alpha-compute-cluster",
      environment: "PRODUCTION",
      status: "ACTIVE",
      heartbeat_interval_sec: 15,
      quorum_policy: "MAJORITY_QUORUM",
      tags: ["pci-dss", "low-latency", "edge-west"],
      temporal_header: {
        effective_from: "2026-01-02T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-02T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  nodes: [
    {
      id: "urn:pingo:node:44444444-4444-4444-8444-444444444444",
      nest_id: "urn:pingo:nest:33333333-3333-4333-8333-333333333333",
      node_key: "HW-FINGERPRINT-SEC-98210",
      hostname: "node-alpha-01.edge.apexcyber.internal",
      status: "HEALTHY",
      ip_address: "10.240.12.101",
      firmware_or_runtime_version: "2.4.1",
      last_heartbeat_at: "2026-10-18T21:58:00.000Z",
      resource_metrics: {
        cpu_cores: 64,
        memory_mb: 262144,
        storage_gb: 4096
      },
      temporal_header: {
        effective_from: "2026-01-02T12:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-02T12:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  subjects: [
    {
      id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      principal_type: "HUMAN_OPERATOR",
      identifier_handle: "alice.principal@apexcyber.example",
      status: "ACTIVE",
      security_clearance: "RESTRICTED",
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    },
    {
      id: "urn:pingo:sbj:88888888-8888-4888-8888-888888888888",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      principal_type: "HUMAN_OPERATOR",
      identifier_handle: "bob.operator@apexcyber.example",
      status: "ACTIVE",
      security_clearance: "CONFIDENTIAL",
      temporal_header: {
        effective_from: "2026-01-05T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-05T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    },
    {
      id: "urn:pingo:sbj:77777777-7777-4777-8777-777777777777",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      principal_type: "HUMAN_OPERATOR",
      identifier_handle: "claire.auditor@apexcyber.example",
      status: "ACTIVE",
      security_clearance: "RESTRICTED",
      temporal_header: {
        effective_from: "2026-01-10T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-10T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  roles: [
    {
      id: "urn:pingo:role:aaaa1111-1111-4aaa-8aaa-111111111111",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      role_name: "cluster_admin",
      description: "Full cluster management and administrative control",
      permissions: ["nest:*", "pingo:*", "policy:read"],
      is_system_role: true,
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    },
    {
      id: "urn:pingo:role:aaaa2222-2222-4aaa-8aaa-222222222222",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      role_name: "compliance_auditor",
      description: "Independent audit and historical ledger inspection",
      permissions: ["audit:read", "audit:verify", "policy:read"],
      is_system_role: true,
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  grants: [
    {
      id: "urn:pingo:grant:bbbb1111-1111-4bbb-8bbb-111111111111",
      subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      role_id: "urn:pingo:role:aaaa1111-1111-4aaa-8aaa-111111111111",
      scope_type: "ORGANIZATION",
      scope_target_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      granted_by: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      is_revoked: false,
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    },
    {
      id: "urn:pingo:grant:bbbb2222-2222-4bbb-8bbb-222222222222",
      subject_id: "urn:pingo:sbj:77777777-7777-4777-8777-777777777777",
      role_id: "urn:pingo:role:aaaa2222-2222-4aaa-8aaa-222222222222",
      scope_type: "ORGANIZATION",
      scope_target_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      granted_by: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      is_revoked: false,
      temporal_header: {
        effective_from: "2026-01-10T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-10T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  policies: [
    {
      id: "urn:pingo:pol:cccc1111-1111-4ccc-8ccc-111111111111",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      policy_code: "SOD-ADMIN-AUDITOR-MUTEX",
      policy_type: "SEPARATION_OF_DUTIES",
      enforcement_level: "HARD_STOP",
      rules_expression: {
        conflicting_role_names: ["cluster_admin", "compliance_auditor"]
      },
      status: "ENFORCED",
      temporal_header: {
        effective_from: "2026-01-01T00:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-01-01T00:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  approval_requests: [
    {
      id: "urn:pingo:apr:dddd1111-1111-4ddd-8ddd-111111111111",
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      policy_id: "urn:pingo:pol:cccc1111-1111-4ccc-8ccc-111111111111",
      requester_subject_id: "urn:pingo:sbj:88888888-8888-4888-8888-888888888888",
      target_resource_id: "urn:pingo:nest:33333333-3333-4333-8333-333333333333",
      action: "nest:decommission",
      payload_preview: { reason: "Scheduled fleet refresh" },
      approver_subject_ids: ["urn:pingo:sbj:99999999-9999-4999-8999-999999999999"],
      status: "APPROVED",
      expires_at: "2026-10-19T02:00:00.000Z",
      temporal_header: {
        effective_from: "2026-10-18T20:00:00.000Z",
        effective_to: "9999-12-31T23:59:59.999Z",
        recorded_at: "2026-10-18T20:00:00.000Z",
        recorded_by_subject_id: "urn:pingo:sbj:88888888-8888-4888-8888-888888888888",
        supersedes_record_id: null,
        is_current_valid_snapshot: true
      }
    }
  ],
  audit_records: [
    {
      id: "urn:pingo:aud:eeee1111-1111-4eee-8eee-111111111111",
      sequence_number: 1,
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      actor_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      operation_class: "CREATE",
      target_entity_type: "Organization",
      target_entity_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      pre_state_hash: "GENESIS_HASH",
      post_state_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      previous_audit_entry_hash: "GENESIS_HASH",
      entry_signature_hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      client_metadata: {
        ip: "192.168.1.10",
        request_id: "req-genesis-001"
      },
      recorded_at: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "urn:pingo:aud:eeee2222-2222-4eee-8eee-222222222222",
      sequence_number: 2,
      org_id: "urn:pingo:org:11111111-1111-4111-8111-111111111111",
      actor_subject_id: "urn:pingo:sbj:99999999-9999-4999-8999-999999999999",
      operation_class: "CREATE",
      target_entity_type: "Nest",
      target_entity_id: "urn:pingo:nest:33333333-3333-4333-8333-333333333333",
      pre_state_hash: "GENESIS_HASH",
      post_state_hash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
      previous_audit_entry_hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      entry_signature_hash: "f4a5b6c7d8e90123456789abcdef0123456789abcdef0123456789abcdef0123",
      client_metadata: {
        ip: "192.168.1.10",
        request_id: "req-nest-create-002"
      },
      recorded_at: "2026-01-02T00:00:00.000Z"
    }
  ]
};
