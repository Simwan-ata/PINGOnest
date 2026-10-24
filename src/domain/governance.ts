/**
 * PingoNest ST1 Governance Engine
 * Separation of Duties, Dual-Custody Approval, and Conflict of Interest Evaluation
 */
import { ApprovalRequest, GovernancePolicy, PingoNestBundle, Subject, UrnId } from './types';

export interface GovernanceValidationResult {
  allowed: boolean;
  violationCode?: string;
  policyCode?: string;
  message: string;
}

export function validateApprovalSubmission(
  approval: ApprovalRequest,
  bundle: PingoNestBundle
): GovernanceValidationResult {
  const policy = bundle.policies.find((p) => p.id === approval.policy_id);
  if (!policy) {
    return {
      allowed: false,
      violationCode: 'POLICY_NOT_FOUND',
      message: `Referenced policy '${approval.policy_id}' does not exist.`
    };
  }

  if (policy.status !== 'ENFORCED') {
    return {
      allowed: false,
      violationCode: 'POLICY_NOT_ENFORCED',
      message: `Policy '${policy.policy_code}' is in state '${policy.status}', not ENFORCED.`
    };
  }

  // Cross-tenant guard
  if (approval.org_id !== policy.org_id) {
    return {
      allowed: false,
      violationCode: 'CROSS_TENANT_POLICY_MISMATCH',
      message: `Approval org '${approval.org_id}' does not match policy org '${policy.org_id}'.`
    };
  }

  // Dual-custody invariant: Requester cannot self-approve
  if (approval.approver_subject_ids.includes(approval.requester_subject_id)) {
    return {
      allowed: false,
      violationCode: 'SOD_SELF_APPROVAL_PROHIBITED',
      policyCode: policy.policy_code,
      message: `Separation of Duties violation: Requester '${approval.requester_subject_id}' cannot approve their own request.`
    };
  }

  return {
    allowed: true,
    message: 'Approval request satisfies all governance and SoD constraints.'
  };
}

export function evaluateSeparationOfDuties(
  subjectId: UrnId,
  assignedRoleIds: UrnId[],
  bundle: PingoNestBundle
): GovernanceValidationResult {
  const subject = bundle.subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return { allowed: false, message: 'Subject not found' };
  }

  const roleNames = assignedRoleIds
    .map((rid) => bundle.roles.find((r) => r.id === rid)?.role_name)
    .filter(Boolean) as string[];

  const policies = bundle.policies.filter(
    (p) => p.org_id === subject.org_id && p.status === 'ENFORCED' && p.policy_type === 'SEPARATION_OF_DUTIES'
  );

  for (const pol of policies) {
    const conflicting = (pol.rules_expression?.conflicting_role_names as string[]) || [];
    const intersection = conflicting.filter((r) => roleNames.includes(r));
    if (intersection.length >= 2) {
      return {
        allowed: false,
        violationCode: 'SOD_CONFLICTING_ROLES',
        policyCode: pol.policy_code,
        message: `Separation of Duties conflict under policy '${pol.policy_code}': User cannot hold both [${intersection.join(', ')}] simultaneously.`
      };
    }
  }

  return { allowed: true, message: 'No separation of duties conflict detected.' };
}
