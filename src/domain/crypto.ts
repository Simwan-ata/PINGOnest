/**
 * PingoNest ST1 Cryptographic Utilities
 * Real SHA-256 Hash Calculation and Ledger Block Chaining
 */

export async function computeSha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashEntityState(entity: any): Promise<string> {
  const serialized = JSON.stringify(entity, Object.keys(entity).sort());
  return computeSha256(serialized);
}

export async function createChainedAuditRecord(
  sequenceNumber: number,
  orgId: string,
  actorSubjectId: string,
  operationClass: 'CREATE' | 'UPDATE' | 'TRANSITION' | 'DELETE_SOFT' | 'AUTH_PERMIT' | 'AUTH_DENY' | 'POLICY_VETO',
  targetEntityType: string,
  targetEntityId: string,
  preStateHash: string,
  postStateHash: string,
  previousAuditEntryHash: string,
  metadata: Record<string, any> = {}
) {
  const id = `urn:pingo:aud:${crypto.randomUUID()}`;
  const recordedAt = new Date().toISOString();

  // Signature digest: SHA-256(seq + org + actor + op + target + pre + post + prev + time)
  const signatureInput = `${sequenceNumber}:${orgId}:${actorSubjectId}:${operationClass}:${targetEntityId}:${preStateHash}:${postStateHash}:${previousAuditEntryHash}:${recordedAt}`;
  const entrySignatureHash = await computeSha256(signatureInput);

  return {
    id,
    sequence_number: sequenceNumber,
    org_id: orgId,
    actor_subject_id: actorSubjectId,
    operation_class: operationClass,
    target_entity_type: targetEntityType,
    target_entity_id: targetEntityId,
    pre_state_hash: preStateHash,
    post_state_hash: postStateHash,
    previous_audit_entry_hash: previousAuditEntryHash,
    entry_signature_hash: entrySignatureHash,
    client_metadata: {
      ip: '127.0.0.1',
      user_agent: 'PingoNest-ControlPlane/1.0',
      ...metadata
    },
    recorded_at: recordedAt
  };
}

export async function verifyAuditChain(records: any[]): Promise<{
  isValid: boolean;
  brokenIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  reason?: string;
}> {
  let expectedPrev = 'GENESIS_HASH';

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];

    // 1. Check Sequence Monotonicity
    if (rec.sequence_number !== i + 1) {
      return {
        isValid: false,
        brokenIndex: i,
        reason: `Non-monotonic sequence number: Expected ${i + 1}, found ${rec.sequence_number}`
      };
    }

    // 2. Check Chain Predecessor Hash
    if (i > 0 && rec.previous_audit_entry_hash !== expectedPrev) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: expectedPrev,
        actualHash: rec.previous_audit_entry_hash,
        reason: `Cryptographic link severed at sequence ${rec.sequence_number}`
      };
    }

    expectedPrev = rec.entry_signature_hash;
  }

  return { isValid: true };
}
