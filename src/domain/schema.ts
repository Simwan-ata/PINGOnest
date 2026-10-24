/**
 * PingoNest ST1 Schema Constant
 * Synchronized with /spec/pingonest-st1.schema.json
 */
export const PINGONEST_ST1_SCHEMA = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://pingonest.io/schemas/v1/st1-canonical-bundle.json",
  "title": "PingoNest ST1 Canonical Data Exchange Bundle",
  "description": "Formal JSON Schema specification for PingoNest ST1 greenfield architecture baseline.",
  "type": "object",
  "required": ["version", "generated_at", "organizations", "workspaces", "nests", "nodes", "subjects", "roles", "grants", "policies", "approval_requests", "audit_records"],
  "additionalProperties": false,
  "properties": {
    "version": {
      "type": "string",
      "const": "1.0.0-st1"
    },
    "generated_at": {
      "type": "string",
      "format": "date-time"
    },
    "organizations": {
      "type": "array",
      "items": { "$ref": "#/$defs/Organization" }
    },
    "workspaces": {
      "type": "array",
      "items": { "$ref": "#/$defs/Workspace" }
    },
    "nests": {
      "type": "array",
      "items": { "$ref": "#/$defs/Nest" }
    },
    "nodes": {
      "type": "array",
      "items": { "$ref": "#/$defs/PingoNode" }
    },
    "subjects": {
      "type": "array",
      "items": { "$ref": "#/$defs/Subject" }
    },
    "roles": {
      "type": "array",
      "items": { "$ref": "#/$defs/RoleDefinition" }
    },
    "grants": {
      "type": "array",
      "items": { "$ref": "#/$defs/RoleGrant" }
    },
    "policies": {
      "type": "array",
      "items": { "$ref": "#/$defs/GovernancePolicy" }
    },
    "approval_requests": {
      "type": "array",
      "items": { "$ref": "#/$defs/ApprovalRequest" }
    },
    "audit_records": {
      "type": "array",
      "items": { "$ref": "#/$defs/AuditTransactionRecord" }
    }
  },
  "$defs": {
    "UrnIdentifier": {
      "type": "string",
      "pattern": "^urn:pingo:[a-z0-9_-]+:[0-9a-fA-F-]{36}$"
    },
    "Sha256Hash": {
      "type": "string",
      "pattern": "^([a-fA-F0-9]{64}|GENESIS_HASH)$"
    },
    "BitemporalInterval": {
      "type": "object",
      "required": ["effective_from", "effective_to", "recorded_at", "recorded_by_subject_id", "is_current_valid_snapshot"],
      "additionalProperties": false,
      "properties": {
        "effective_from": { "type": "string", "format": "date-time" },
        "effective_to": { "type": "string", "format": "date-time" },
        "recorded_at": { "type": "string", "format": "date-time" },
        "recorded_by_subject_id": { "$ref": "#/$defs/UrnIdentifier" },
        "supersedes_record_id": { "type": ["string", "null"] },
        "is_current_valid_snapshot": { "type": "boolean" }
      }
    },
    "Organization": {
      "type": "object",
      "required": ["id", "slug", "display_name", "status", "tier", "isolation_level", "contact_email", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "slug": { "type": "string", "pattern": "^[a-z0-9-]+$", "minLength": 3, "maxLength": 64 },
        "display_name": { "type": "string", "minLength": 1, "maxLength": 128 },
        "status": { "type": "string", "enum": ["DRAFT", "ACTIVE", "SUSPENDED", "RETIRED"] },
        "tier": { "type": "string", "enum": ["COMMUNITY", "ENTERPRISE", "MISSION_CRITICAL"] },
        "isolation_level": { "type": "string", "enum": ["SHARED_POOL", "DEDICATED_VIRTUAL", "AIR_GAPPED"] },
        "contact_email": { "type": "string", "format": "email" },
        "metadata": { "type": "object", "additionalProperties": { "type": "string" } },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "Workspace": {
      "type": "object",
      "required": ["id", "org_id", "code", "name", "status", "max_nests", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "code": { "type": "string", "pattern": "^[a-zA-Z0-9_-]{2,32}$" },
        "name": { "type": "string", "minLength": 1, "maxLength": 128 },
        "status": { "type": "string", "enum": ["DRAFT", "ACTIVE", "SUSPENDED", "RETIRED"] },
        "max_nests": { "type": "integer", "minimum": 1, "maximum": 1000 },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "Nest": {
      "type": "object",
      "required": ["id", "org_id", "workspace_id", "nest_name", "environment", "status", "heartbeat_interval_sec", "quorum_policy", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "workspace_id": { "$ref": "#/$defs/UrnIdentifier" },
        "nest_name": { "type": "string", "minLength": 1, "maxLength": 128 },
        "environment": { "type": "string", "enum": ["DEVELOPMENT", "STAGING", "PRODUCTION", "DISASTER_RECOVERY"] },
        "status": { "type": "string", "enum": ["PROVISIONING", "ACTIVE", "DRAINING", "DECOMMISSIONED"] },
        "heartbeat_interval_sec": { "type": "integer", "minimum": 1, "maximum": 3600 },
        "quorum_policy": { "type": "string", "enum": ["SINGLETON", "MAJORITY_QUORUM", "CONSENSUS_STRICT"] },
        "tags": { "type": "array", "items": { "type": "string" } },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "PingoNode": {
      "type": "object",
      "required": ["id", "nest_id", "node_key", "hostname", "status", "ip_address", "firmware_or_runtime_version", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "nest_id": { "$ref": "#/$defs/UrnIdentifier" },
        "node_key": { "type": "string", "minLength": 4, "maxLength": 128 },
        "hostname": { "type": "string", "minLength": 1, "maxLength": 255 },
        "status": { "type": "string", "enum": ["REGISTERED", "INITIALIZING", "HEALTHY", "DEGRADED", "OFFLINE", "REVOKED"] },
        "ip_address": { "type": "string" },
        "firmware_or_runtime_version": { "type": "string" },
        "last_heartbeat_at": { "type": "string", "format": "date-time" },
        "resource_metrics": {
          "type": "object",
          "properties": {
            "cpu_cores": { "type": "integer", "minimum": 1 },
            "memory_mb": { "type": "integer", "minimum": 128 },
            "storage_gb": { "type": "integer", "minimum": 1 }
          }
        },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "Subject": {
      "type": "object",
      "required": ["id", "org_id", "principal_type", "identifier_handle", "status", "security_clearance", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "principal_type": { "type": "string", "enum": ["HUMAN_OPERATOR", "SERVICE_PRINCIPAL", "SYSTEM_DAEMON"] },
        "identifier_handle": { "type": "string", "minLength": 3, "maxLength": 128 },
        "status": { "type": "string", "enum": ["PENDING_INVITE", "ACTIVE", "SUSPENDED", "REVOKED"] },
        "security_clearance": { "type": "string", "enum": ["STANDARD", "CONFIDENTIAL", "RESTRICTED"] },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "RoleDefinition": {
      "type": "object",
      "required": ["id", "org_id", "role_name", "description", "permissions", "is_system_role", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "role_name": { "type": "string", "pattern": "^[a-z0-9_]{3,64}$" },
        "description": { "type": "string", "maxLength": 500 },
        "permissions": {
          "type": "array",
          "minItems": 1,
          "items": { "type": "string", "pattern": "^[a-z_]+:[a-z_*]+$" }
        },
        "is_system_role": { "type": "boolean" },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "RoleGrant": {
      "type": "object",
      "required": ["id", "subject_id", "role_id", "scope_type", "scope_target_id", "granted_by", "is_revoked", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "subject_id": { "$ref": "#/$defs/UrnIdentifier" },
        "role_id": { "$ref": "#/$defs/UrnIdentifier" },
        "scope_type": { "type": "string", "enum": ["GLOBAL", "ORGANIZATION", "WORKSPACE", "NEST", "PINGO_NODE"] },
        "scope_target_id": { "$ref": "#/$defs/UrnIdentifier" },
        "granted_by": { "$ref": "#/$defs/UrnIdentifier" },
        "is_revoked": { "type": "boolean" },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "GovernancePolicy": {
      "type": "object",
      "required": ["id", "org_id", "policy_code", "policy_type", "enforcement_level", "rules_expression", "status", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "policy_code": { "type": "string", "pattern": "^[A-Z0-9_-]{3,64}$" },
        "policy_type": { "type": "string", "enum": ["SEPARATION_OF_DUTIES", "MANDATORY_APPROVAL", "TIME_WINDOW_RESTRICTION", "QUORUM_ENFORCEMENT"] },
        "enforcement_level": { "type": "string", "enum": ["HARD_STOP", "AUDIT_ALERT_ONLY"] },
        "rules_expression": { "type": "object" },
        "status": { "type": "string", "enum": ["DRAFT", "ENFORCED", "SUSPENDED", "DEPRECATED"] },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "ApprovalRequest": {
      "type": "object",
      "required": ["id", "org_id", "policy_id", "requester_subject_id", "target_resource_id", "action", "payload_preview", "approver_subject_ids", "status", "expires_at", "temporal_header"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "policy_id": { "$ref": "#/$defs/UrnIdentifier" },
        "requester_subject_id": { "$ref": "#/$defs/UrnIdentifier" },
        "target_resource_id": { "$ref": "#/$defs/UrnIdentifier" },
        "action": { "type": "string" },
        "payload_preview": { "type": "object" },
        "approver_subject_ids": { "type": "array", "items": { "$ref": "#/$defs/UrnIdentifier" } },
        "status": { "type": "string", "enum": ["PENDING", "APPROVED", "REJECTED", "EXPIRED", "CANCELLED"] },
        "expires_at": { "type": "string", "format": "date-time" },
        "temporal_header": { "$ref": "#/$defs/BitemporalInterval" }
      }
    },
    "AuditTransactionRecord": {
      "type": "object",
      "required": ["id", "sequence_number", "org_id", "actor_subject_id", "operation_class", "target_entity_type", "target_entity_id", "pre_state_hash", "post_state_hash", "previous_audit_entry_hash", "entry_signature_hash", "client_metadata", "recorded_at"],
      "additionalProperties": false,
      "properties": {
        "id": { "$ref": "#/$defs/UrnIdentifier" },
        "sequence_number": { "type": "integer", "minimum": 1 },
        "org_id": { "$ref": "#/$defs/UrnIdentifier" },
        "actor_subject_id": { "$ref": "#/$defs/UrnIdentifier" },
        "operation_class": { "type": "string", "enum": ["CREATE", "UPDATE", "TRANSITION", "DELETE_SOFT", "AUTH_PERMIT", "AUTH_DENY", "POLICY_VETO"] },
        "target_entity_type": { "type": "string" },
        "target_entity_id": { "$ref": "#/$defs/UrnIdentifier" },
        "pre_state_hash": { "$ref": "#/$defs/Sha256Hash" },
        "post_state_hash": { "$ref": "#/$defs/Sha256Hash" },
        "previous_audit_entry_hash": { "$ref": "#/$defs/Sha256Hash" },
        "entry_signature_hash": { "$ref": "#/$defs/Sha256Hash" },
        "client_metadata": { "type": "object" },
        "recorded_at": { "type": "string", "format": "date-time" }
      }
    }
  }
} as const;
