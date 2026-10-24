/**
 * PingoNest ST1 Finite State Machine & Lifecycle Simulator
 */
import { OrgStatus, WorkspaceStatus, NestStatus, NodeStatus, SubjectStatus, PolicyStatus, ApprovalStatus } from './types';

export interface TransitionRule<T extends string> {
  from: T;
  to: T;
  description: string;
  guard?: (context: any) => { allowed: boolean; reason?: string };
}

export const ORG_TRANSITIONS: TransitionRule<OrgStatus>[] = [
  {
    from: 'DRAFT',
    to: 'ACTIVE',
    description: 'Promote organization to operational state',
    guard: (ctx) => {
      if (!ctx || ctx.activeAdminCount < 1) {
        return { allowed: false, reason: 'Organization must have at least 1 active Admin Subject prior to activation.' };
      }
      return { allowed: true };
    }
  },
  {
    from: 'ACTIVE',
    to: 'SUSPENDED',
    description: 'Administrative or compliance suspension',
    guard: () => ({ allowed: true })
  },
  {
    from: 'SUSPENDED',
    to: 'ACTIVE',
    description: 'Reactivation after compliance clearance',
    guard: () => ({ allowed: true })
  },
  {
    from: 'ACTIVE',
    to: 'RETIRED',
    description: 'Graceful decommissioning of organization',
    guard: (ctx) => {
      if (ctx && ctx.activeNestCount > 0) {
        return { allowed: false, reason: 'Cannot retire Organization while active Nests exist. Decommission all Nests first.' };
      }
      return { allowed: true };
    }
  },
  {
    from: 'SUSPENDED',
    to: 'RETIRED',
    description: 'Decommissioning from suspended state',
    guard: (ctx) => {
      if (ctx && ctx.activeNestCount > 0) {
        return { allowed: false, reason: 'Cannot retire Organization while active Nests exist.' };
      }
      return { allowed: true };
    }
  }
];

export const NEST_TRANSITIONS: TransitionRule<NestStatus>[] = [
  {
    from: 'PROVISIONING',
    to: 'ACTIVE',
    description: 'Quorum established and cluster handshake verified',
    guard: (ctx) => {
      if (ctx && ctx.onlineNodes < 1) {
        return { allowed: false, reason: 'Nest requires at least one healthy online PingoNode before activating.' };
      }
      return { allowed: true };
    }
  },
  {
    from: 'ACTIVE',
    to: 'DRAINING',
    description: 'Stop scheduling new workloads and begin node evacuation',
    guard: () => ({ allowed: true })
  },
  {
    from: 'DRAINING',
    to: 'DECOMMISSIONED',
    description: 'All workloads drained; mark cluster as decommissioned',
    guard: (ctx) => {
      if (ctx && ctx.activeWorkloads > 0) {
        return { allowed: false, reason: 'Active workloads remaining; cannot decommission until drained.' };
      }
      return { allowed: true };
    }
  }
];

export const NODE_TRANSITIONS: TransitionRule<NodeStatus>[] = [
  { from: 'REGISTERED', to: 'INITIALIZING', description: 'Attestation started' },
  { from: 'INITIALIZING', to: 'HEALTHY', description: 'Self-test passed and heartbeat verified' },
  { from: 'HEALTHY', to: 'DEGRADED', description: 'Missed heartbeats threshold exceeded' },
  { from: 'DEGRADED', to: 'HEALTHY', description: 'Consecutive heartbeat recovery' },
  { from: 'DEGRADED', to: 'OFFLINE', description: 'Heartbeat timeout limit expired' },
  { from: 'OFFLINE', to: 'INITIALIZING', description: 'Node reboot and reconnect' },
  { from: 'HEALTHY', to: 'REVOKED', description: 'Security revocation or node decommission' },
  { from: 'OFFLINE', to: 'REVOKED', description: 'Security revocation' }
];

export function validateStateTransition<T extends string>(
  rules: TransitionRule<T>[],
  currentStatus: T,
  targetStatus: T,
  context?: any
): { valid: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { valid: false, reason: `Entity is already in '${currentStatus}' state.` };
  }

  const matchingRule = rules.find((r) => r.from === currentStatus && r.to === targetStatus);
  if (!matchingRule) {
    return {
      valid: false,
      reason: `Illegal state transition: Cannot transition from '${currentStatus}' to '${targetStatus}'. Prohibited by lifecycle FSM.`
    };
  }

  if (matchingRule.guard) {
    const guardResult = matchingRule.guard(context);
    if (!guardResult.allowed) {
      return { valid: false, reason: guardResult.reason || 'Transition precondition guard failed.' };
    }
  }

  return { valid: true };
}
