import { PrefixedId } from "@/shared/types/id-prefixes";


/**
 * Generated from: src/shared/data-layer/protocards/protocards.ts
 * Entity: Protocard with prefix 'pc'
 */

export const _PREFIXES = {
  // DB
  PROTOCARD_ENTITY: 'pce_',
  PROTOCARD_VERSION: 'pcv_',
  PROTOCARD_SNAPSHOT: 'pcs_',
  // Client
  PROTOCARD_ENTITY_CLIENT: 'pcf_',
  PROTOCARD_VERSION_CLIENT: 'pcw_',
  PROTOCARD_SNAPSHOT_CLIENT: 'pct_',
} as const

export type ProtocardEntityId = PrefixedId<typeof _PREFIXES.PROTOCARD_ENTITY>;
export type ProtocardVersionId = PrefixedId<typeof _PREFIXES.PROTOCARD_VERSION>;
export type ProtocardSnapshotId = PrefixedId<typeof _PREFIXES.PROTOCARD_SNAPSHOT>;
export type ProtocardEntityClientId = PrefixedId<typeof _PREFIXES.PROTOCARD_ENTITY_CLIENT>;
export type ProtocardVersionClientId = PrefixedId<typeof _PREFIXES.PROTOCARD_VERSION_CLIENT>;
export type ProtocardSnapshotClientId = PrefixedId<typeof _PREFIXES.PROTOCARD_SNAPSHOT_CLIENT>;

export type ProtocardEntityOrder = (number | string) & { __protocard_entity_order: true };
export type ProtocardVersionOrder = (number | string) & { __protocard_version_order: true };
export type ProtocardSnapshotOrder = (number | string) & { __protocard_snapshot_order: true };
export type ProtocardEntityClientOrder = (number | string) & { __protocard_entity_client_order: true };
export type ProtocardVersionClientOrder = (number | string) & { __protocard_version_client_order: true };
export type ProtocardSnapshotClientOrder = (number | string) & { __protocard_snapshot_client_order: true };
