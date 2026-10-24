/**
 * PingoNest ST1 Canonical Domain Types
 * Greenfield Architecture Baseline
 */

export type UrnId = string; // format: urn:pingo:<type>:<uuid>
export type Sha256 = string;

export interface BitemporalInterval {
  effective_from: string; // ISO8601 UTC
  effective_to: string; // ISO8601 UTC
  recorded_at: string; // ISO8601 UTC
  recorded_by_subject_id: UrnId;
  supersedes_record_id: UrnId | null;
  is_current_valid_snapshot: boolean;
}

export type OrgStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
export type OrgTier = 'COMMUNITY' | 'ENTERPRISE' | 'MISSION_CRITICAL';
export type OrgIsolation = 'SHARED_POOL' | 'DEDICATED_VIRTUAL' | 'AIR_GAPPED';

export interface Organization {
  id: UrnId;
  slug: string;
  display_name: string;
  status: OrgStatus;
  tier: OrgTier;
  isolation_level: OrgIsolation;
  contact_email: string;
  metadata?: Record<string, string>;
  temporal_header: BitemporalInterval;
}

export type WorkspaceStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

export interface Workspace {
  id: UrnId;
  org_id: UrnId;
  code: string;
  name: string;
  status: WorkspaceStatus;
  max_nests: number;
  temporal_header: BitemporalInterval;
}

export type NestEnvironment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'DISASTER_RECOVERY';
export type NestStatus = 'PROVISIONING' | 'ACTIVE' | 'DRAINING' | 'DECOMMISSIONED';
export type QuorumPolicy = 'SINGLETON' | 'MAJORITY_QUORUM' | 'CONSENSUS_STRICT';

export interface Nest {
  id: UrnId;
  org_id: UrnId;
  workspace_id: UrnId;
  nest_name: string;
  environment: NestEnvironment;
  status: NestStatus;
  heartbeat_interval_sec: number;
  quorum_policy: QuorumPolicy;
  tags?: string[];
  temporal_header: BitemporalInterval;
}

export type NodeStatus = 'REGISTERED' | 'INITIALIZING' | 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'REVOKED';

export interface PingoNode {
  id: UrnId;
  nest_id: UrnId;
  node_key: string;
  hostname: string;
  status: NodeStatus;
  ip_address: string;
  firmware_or_runtime_version: string;
  last_heartbeat_at?: string;
  resource_metrics?: {
    cpu_cores: number;
    memory_mb: number;
    storage_gb: number;
  };
  temporal_header: BitemporalInterval;
}

export type PrincipalType = 'HUMAN_OPERATOR' | 'SERVICE_PRINCIPAL' | 'SYSTEM_DAEMON';
export type SubjectStatus = 'PENDING_INVITE' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
export type SecurityClearance = 'STANDARD' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface Subject {
  id: UrnId;
  org_id: UrnId;
  principal_type: PrincipalType;
  identifier_handle: string;
  status: SubjectStatus;
  security_clearance: SecurityClearance;
  temporal_header: BitemporalInterval;
}

export interface RoleDefinition {
  id: UrnId;
  org_id: UrnId;
  role_name: string;
  description: string;
  permissions: string[]; // e.g. "nest:create", "pingo:reboot"
  is_system_role: boolean;
  temporal_header: BitemporalInterval;
}

export type ScopeType = 'GLOBAL' | 'ORGANIZATION' | 'WORKSPACE' | 'NEST' | 'PINGO_NODE';

export interface RoleGrant {
  id: UrnId;
  subject_id: UrnId;
  role_id: UrnId;
  scope_type: ScopeType;
  scope_target_id: UrnId;
  granted_by: UrnId;
  is_revoked: boolean;
  temporal_header: BitemporalInterval;
}

export type PolicyType = 'SEPARATION_OF_DUTIES' | 'MANDATORY_APPROVAL' | 'TIME_WINDOW_RESTRICTION' | 'QUORUM_ENFORCEMENT';
export type EnforcementLevel = 'HARD_STOP' | 'AUDIT_ALERT_ONLY';
export type PolicyStatus = 'DRAFT' | 'ENFORCED' | 'SUSPENDED' | 'DEPRECATED';

export interface GovernancePolicy {
  id: UrnId;
  org_id: UrnId;
  policy_code: string;
  policy_type: PolicyType;
  enforcement_level: EnforcementLevel;
  rules_expression: Record<string, any>;
  status: PolicyStatus;
  temporal_header: BitemporalInterval;
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface ApprovalRequest {
  id: UrnId;
  org_id: UrnId;
  policy_id: UrnId;
  requester_subject_id: UrnId;
  target_resource_id: UrnId;
  action: string;
  payload_preview: Record<string, any>;
  approver_subject_ids: UrnId[];
  status: ApprovalStatus;
  expires_at: string;
  temporal_header: BitemporalInterval;
}

export type OperationClass = 'CREATE' | 'UPDATE' | 'TRANSITION' | 'DELETE_SOFT' | 'AUTH_PERMIT' | 'AUTH_DENY' | 'POLICY_VETO';

export interface AuditTransactionRecord {
  id: UrnId;
  sequence_number: number;
  org_id: UrnId;
  actor_subject_id: UrnId;
  operation_class: OperationClass;
  target_entity_type: string;
  target_entity_id: UrnId;
  pre_state_hash: Sha256;
  post_state_hash: Sha256;
  previous_audit_entry_hash: Sha256;
  entry_signature_hash: Sha256;
  client_metadata: Record<string, any>;
  recorded_at: string;
}

export interface PingoNestBundle {
  version: '1.0.0-st1';
  generated_at: string;
  organizations: Organization[];
  workspaces: Workspace[];
  nests: Nest[];
  nodes: PingoNode[];
  subjects: Subject[];
  roles: RoleDefinition[];
  grants: RoleGrant[];
  policies: GovernancePolicy[];
  approval_requests: ApprovalRequest[];
  audit_records: AuditTransactionRecord[];
}
