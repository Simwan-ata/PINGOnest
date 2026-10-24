/**
 * PingoNest ST1 Validator Engine
 * Hybrid Validator: Ajv JSON Schema (RFC-compliant) + Semantic & Invariant Engine
 */
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { PINGONEST_ST1_SCHEMA } from '../domain/schema';
import { PingoNestBundle, UrnId } from '../domain/types';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(PINGONEST_ST1_SCHEMA);

export interface ValidationIssue {
  layer: 'STRUCTURAL_SCHEMA' | 'REFERENTIAL_INTEGRITY' | 'BITEMPORAL_OVERLAP' | 'SECURITY_BOUNDARY' | 'AUDIT_LEDGER_CHAIN';
  severity: 'FATAL_ERROR' | 'WARNING';
  entityCode?: string;
  entityId?: UrnId;
  fieldPath?: string;
  ruleCode: string;
  message: string;
}

export interface ComprehensiveValidationReport {
  isValid: boolean;
  timestamp: string;
  totalErrors: number;
  totalWarnings: number;
  schemaValid: boolean;
  issues: ValidationIssue[];
  metrics: {
    organizationsCount: number;
    workspacesCount: number;
    nestsCount: number;
    nodesCount: number;
    subjectsCount: number;
    rolesCount: number;
    grantsCount: number;
    policiesCount: number;
    auditRecordsCount: number;
  };
}

export function validateBundle(bundle: any): ComprehensiveValidationReport {
  const issues: ValidationIssue[] = [];
  const timestamp = new Date().toISOString();

  // 1. Structural Schema Validation (Ajv)
  const isSchemaValid = validateJsonSchema(bundle) as boolean;
  if (!isSchemaValid && validateJsonSchema.errors) {
    for (const err of validateJsonSchema.errors) {
      issues.push({
        layer: 'STRUCTURAL_SCHEMA',
        severity: 'FATAL_ERROR',
        fieldPath: err.instancePath || '/',
        ruleCode: `SCHEMA_${err.keyword.toUpperCase()}`,
        message: `${err.instancePath} ${err.message}`
      });
    }
  }

  // If basic schema failed fundamentally (not even an object), return early
  if (!bundle || typeof bundle !== 'object') {
    return {
      isValid: false,
      timestamp,
      totalErrors: issues.length,
      totalWarnings: 0,
      schemaValid: false,
      issues,
      metrics: {
        organizationsCount: 0,
        workspacesCount: 0,
        nestsCount: 0,
        nodesCount: 0,
        subjectsCount: 0,
        rolesCount: 0,
        grantsCount: 0,
        policiesCount: 0,
        auditRecordsCount: 0
      }
    };
  }

  const typedBundle = bundle as PingoNestBundle;

  const orgIds = new Set((typedBundle.organizations || []).map((o) => o.id));
  const wspIds = new Set((typedBundle.workspaces || []).map((w) => w.id));
  const nestIds = new Set((typedBundle.nests || []).map((n) => n.id));
  const subjectIds = new Set((typedBundle.subjects || []).map((s) => s.id));
  const roleIds = new Set((typedBundle.roles || []).map((r) => r.id));
  const policyIds = new Set((typedBundle.policies || []).map((p) => p.id));

  // 2. Referential Integrity Checks
  // Check Workspace -> Org
  for (const wsp of typedBundle.workspaces || []) {
    if (!orgIds.has(wsp.org_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-WSP',
        entityId: wsp.id,
        ruleCode: 'REF_ORPHAN_WORKSPACE',
        message: `Workspace '${wsp.name}' references non-existent Organization '${wsp.org_id}'.`
      });
    }
  }

  // Check Nest -> Org & Workspace
  for (const nest of typedBundle.nests || []) {
    if (!orgIds.has(nest.org_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-NST',
        entityId: nest.id,
        ruleCode: 'REF_ORPHAN_NEST_ORG',
        message: `Nest '${nest.nest_name}' references non-existent Organization '${nest.org_id}'.`
      });
    }
    if (!wspIds.has(nest.workspace_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-NST',
        entityId: nest.id,
        ruleCode: 'REF_ORPHAN_NEST_WSP',
        message: `Nest '${nest.nest_name}' references non-existent Workspace '${nest.workspace_id}'.`
      });
    }
  }

  // Check Node -> Nest
  for (const node of typedBundle.nodes || []) {
    if (!nestIds.has(node.nest_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-NOD',
        entityId: node.id,
        ruleCode: 'REF_ORPHAN_NODE',
        message: `PingoNode '${node.hostname}' references non-existent Nest '${node.nest_id}'.`
      });
    }
  }

  // Check RoleGrant -> Subject, Role & Scope Target
  for (const grant of typedBundle.grants || []) {
    if (!subjectIds.has(grant.subject_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-RGR',
        entityId: grant.id,
        ruleCode: 'REF_ORPHAN_GRANT_SUBJECT',
        message: `RoleGrant '${grant.id}' references non-existent Subject '${grant.subject_id}'.`
      });
    }
    if (!roleIds.has(grant.role_id)) {
      issues.push({
        layer: 'REFERENTIAL_INTEGRITY',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-RGR',
        entityId: grant.id,
        ruleCode: 'REF_ORPHAN_GRANT_ROLE',
        message: `RoleGrant '${grant.id}' references non-existent RoleDefinition '${grant.role_id}'.`
      });
    }
  }

  // 3. Bitemporal Interval Validation
  const checkTemporalInterval = (entityCode: string, id: UrnId, header: any) => {
    if (!header) return;
    const from = new Date(header.effective_from).getTime();
    const to = new Date(header.effective_to).getTime();
    if (from > to) {
      issues.push({
        layer: 'BITEMPORAL_OVERLAP',
        severity: 'FATAL_ERROR',
        entityCode,
        entityId: id,
        ruleCode: 'TEMPORAL_INVERTED_INTERVAL',
        message: `Entity '${id}' has effective_from (${header.effective_from}) later than effective_to (${header.effective_to}).`
      });
    }
  };

  (typedBundle.organizations || []).forEach((o) => checkTemporalInterval('ENT-ORG', o.id, o.temporal_header));
  (typedBundle.workspaces || []).forEach((w) => checkTemporalInterval('ENT-WSP', w.id, w.temporal_header));
  (typedBundle.nests || []).forEach((n) => checkTemporalInterval('ENT-NST', n.id, n.temporal_header));
  (typedBundle.nodes || []).forEach((nd) => checkTemporalInterval('ENT-NOD', nd.id, nd.temporal_header));
  (typedBundle.subjects || []).forEach((s) => checkTemporalInterval('ENT-SBJ', s.id, s.temporal_header));
  (typedBundle.grants || []).forEach((g) => checkTemporalInterval('ENT-RGR', g.id, g.temporal_header));

  // 4. Security & Tenant Boundary Isolation
  for (const wsp of typedBundle.workspaces || []) {
    const parentOrg = (typedBundle.organizations || []).find((o) => o.id === wsp.org_id);
    if (parentOrg && parentOrg.status === 'SUSPENDED' && wsp.status === 'ACTIVE') {
      issues.push({
        layer: 'SECURITY_BOUNDARY',
        severity: 'WARNING',
        entityCode: 'ENT-WSP',
        entityId: wsp.id,
        ruleCode: 'PARENT_ORG_SUSPENDED_MISMATCH',
        message: `Workspace '${wsp.name}' is ACTIVE while parent Organization is SUSPENDED.`
      });
    }
  }

  // 5. Cryptographic Audit Ledger Chaining
  const auditRecords = typedBundle.audit_records || [];
  let expectedPrevHash = 'GENESIS_HASH';
  for (let i = 0; i < auditRecords.length; i++) {
    const rec = auditRecords[i];
    if (rec.sequence_number !== i + 1) {
      issues.push({
        layer: 'AUDIT_LEDGER_CHAIN',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-AUD',
        entityId: rec.id,
        ruleCode: 'AUDIT_SEQUENCE_NON_MONOTONIC',
        message: `Audit record '${rec.id}' sequence ${rec.sequence_number} does not match expected sequence ${i + 1}.`
      });
    }

    if (i > 0 && rec.previous_audit_entry_hash !== expectedPrevHash) {
      issues.push({
        layer: 'AUDIT_LEDGER_CHAIN',
        severity: 'FATAL_ERROR',
        entityCode: 'ENT-AUD',
        entityId: rec.id,
        ruleCode: 'AUDIT_CHAIN_BROKEN_HASH',
        message: `Cryptographic audit break: Record sequence ${rec.sequence_number} previous hash (${rec.previous_audit_entry_hash}) does not match predecessor signature (${expectedPrevHash}).`
      });
    }
    expectedPrevHash = rec.entry_signature_hash;
  }

  const fatalErrors = issues.filter((i) => i.severity === 'FATAL_ERROR').length;
  const warnings = issues.filter((i) => i.severity === 'WARNING').length;

  return {
    isValid: fatalErrors === 0,
    timestamp,
    totalErrors: fatalErrors,
    totalWarnings: warnings,
    schemaValid: isSchemaValid,
    issues,
    metrics: {
      organizationsCount: (typedBundle.organizations || []).length,
      workspacesCount: (typedBundle.workspaces || []).length,
      nestsCount: (typedBundle.nests || []).length,
      nodesCount: (typedBundle.nodes || []).length,
      subjectsCount: (typedBundle.subjects || []).length,
      rolesCount: (typedBundle.roles || []).length,
      grantsCount: (typedBundle.grants || []).length,
      policiesCount: (typedBundle.policies || []).length,
      auditRecordsCount: (typedBundle.audit_records || []).length
    }
  };
}
