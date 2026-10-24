/**
 * PingoNest ST1 Canonical 8-Step Authorization Engine
 */
import { Subject, RoleGrant, RoleDefinition, PingoNestBundle, UrnId } from './types';

export interface AuthContext {
  currentTime?: string; // ISO8601 UTC
  ipAddress?: string;
  requestId?: string;
}

export interface AuthEvaluationResult {
  decision: 'PERMIT' | 'DENY';
  stepFailed?: number;
  reasonCode: string;
  matchedGrantId?: UrnId;
  auditExplanation: string;
}

export function evaluateAuthorization(
  subjectId: UrnId,
  action: string, // e.g. "nest:create", "pingo:reboot"
  targetResourceId: UrnId,
  targetOrgId: UrnId,
  bundle: PingoNestBundle,
  context: AuthContext = {}
): AuthEvaluationResult {
  const evalTime = context.currentTime || new Date().toISOString();

  // Step 1: Check Principal Status
  const subject = bundle.subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return {
      decision: 'DENY',
      stepFailed: 1,
      reasonCode: 'SUBJECT_NOT_FOUND',
      auditExplanation: `Subject '${subjectId}' does not exist in identity registry.`
    };
  }

  if (subject.status !== 'ACTIVE') {
    return {
      decision: 'DENY',
      stepFailed: 1,
      reasonCode: 'SUBJECT_INACTIVE',
      auditExplanation: `Subject '${subject.identifier_handle}' is in '${subject.status}' status (must be ACTIVE).`
    };
  }

  // Step 2: Cross-Tenant Check
  if (subject.org_id !== targetOrgId && !subject.org_id.includes(':global')) {
    return {
      decision: 'DENY',
      stepFailed: 2,
      reasonCode: 'CROSS_TENANT_VIOLATION',
      auditExplanation: `Security boundary violation: Subject org '${subject.org_id}' does not match target org '${targetOrgId}'.`
    };
  }

  // Find all candidate grants for this subject
  const candidateGrants = bundle.grants.filter(
    (g) => g.subject_id === subjectId && !g.is_revoked
  );

  if (candidateGrants.length === 0) {
    return {
      decision: 'DENY',
      stepFailed: 3,
      reasonCode: 'NO_ACTIVE_GRANTS',
      auditExplanation: `Default-Deny: Subject has no active, unrevoked role grants.`
    };
  }

  // Evaluate candidate grants through steps 3, 4, 5
  let passedGrant: RoleGrant | null = null;

  for (const grant of candidateGrants) {
    // Step 3: Temporal Grant Window
    const effFrom = grant.temporal_header.effective_from;
    const effTo = grant.temporal_header.effective_to;
    if (evalTime < effFrom || evalTime > effTo) {
      continue; // Grant expired or not yet effective
    }

    // Step 4: Scope Inclusion
    const isScopeMatched = checkScopeCoverage(grant, targetResourceId, targetOrgId, bundle);
    if (!isScopeMatched) {
      continue;
    }

    // Step 5: Permission Match
    const roleDef = bundle.roles.find((r) => r.id === grant.role_id);
    if (!roleDef) {
      continue;
    }

    const hasPermission = roleDef.permissions.some((perm) => {
      if (perm === '*' || perm === action) return true;
      const [pRes, pAct] = perm.split(':');
      const [reqRes, reqAct] = action.split(':');
      if (pRes === reqRes && (pAct === '*' || pAct === reqAct)) return true;
      return false;
    });

    if (hasPermission) {
      passedGrant = grant;
      break;
    }
  }

  if (!passedGrant) {
    return {
      decision: 'DENY',
      stepFailed: 5,
      reasonCode: 'PERMISSION_NOT_GRANTED',
      auditExplanation: `Default-Deny: No temporally valid grant in scope authorizes action '${action}'.`
    };
  }

  // Step 6: Governance Policy Veto & Separation of Duties (SoD)
  const activePolicies = bundle.policies.filter(
    (p) => p.org_id === targetOrgId && p.status === 'ENFORCED'
  );

  for (const policy of activePolicies) {
    if (policy.policy_type === 'SEPARATION_OF_DUTIES') {
      const conflictingRoles: string[] = policy.rules_expression?.conflicting_role_names || [];
      const userRoleNames = candidateGrants
        .map((g) => bundle.roles.find((r) => r.id === g.role_id)?.role_name)
        .filter(Boolean) as string[];

      const intersection = conflictingRoles.filter((r) => userRoleNames.includes(r));
      if (intersection.length >= 2) {
        return {
          decision: 'DENY',
          stepFailed: 6,
          reasonCode: 'SOD_POLICY_VETO',
          matchedGrantId: passedGrant.id,
          auditExplanation: `Governance Hard-Stop: User holds conflicting roles [${intersection.join(', ')}] under policy '${policy.policy_code}'.`
        };
      }
    }
  }

  // Step 7: Target Resource Lifecycle
  const nest = bundle.nests.find((n) => n.id === targetResourceId);
  if (nest && nest.status === 'DECOMMISSIONED' && action !== 'nest:read') {
    return {
      decision: 'DENY',
      stepFailed: 7,
      reasonCode: 'RESOURCE_TERMINAL_STATE',
      matchedGrantId: passedGrant.id,
      auditExplanation: `Lifecycle Guard: Cannot execute mutating action '${action}' on DECOMMISSIONED Nest.`
    };
  }

  const node = bundle.nodes.find((n) => n.id === targetResourceId);
  if (node && (node.status === 'REVOKED' || node.status === 'OFFLINE') && action.startsWith('pingo:mutate')) {
    return {
      decision: 'DENY',
      stepFailed: 7,
      reasonCode: 'NODE_TERMINAL_OR_OFFLINE',
      matchedGrantId: passedGrant.id,
      auditExplanation: `Lifecycle Guard: Cannot dispatch operations to node in '${node.status}' state.`
    };
  }

  // Step 8: Return PERMIT
  return {
    decision: 'PERMIT',
    reasonCode: 'AUTHORIZED_BY_GRANT',
    matchedGrantId: passedGrant.id,
    auditExplanation: `Access granted via Grant '${passedGrant.id}' under scope '${passedGrant.scope_type}'.`
  };
}

function checkScopeCoverage(
  grant: RoleGrant,
  targetResourceId: UrnId,
  targetOrgId: UrnId,
  bundle: PingoNestBundle
): boolean {
  if (grant.scope_type === 'GLOBAL') {
    return true;
  }
  if (grant.scope_type === 'ORGANIZATION') {
    return grant.scope_target_id === targetOrgId;
  }
  if (grant.scope_type === 'WORKSPACE') {
    // If target is workspace itself
    if (grant.scope_target_id === targetResourceId) return true;
    // Or target is a nest inside this workspace
    const nest = bundle.nests.find((n) => n.id === targetResourceId);
    if (nest && nest.workspace_id === grant.scope_target_id) return true;
    return false;
  }
  if (grant.scope_type === 'NEST') {
    if (grant.scope_target_id === targetResourceId) return true;
    // Or target is a node inside this nest
    const node = bundle.nodes.find((n) => n.id === targetResourceId);
    if (node && node.nest_id === grant.scope_target_id) return true;
    return false;
  }
  if (grant.scope_type === 'PINGO_NODE') {
    return grant.scope_target_id === targetResourceId;
  }
  return false;
}
