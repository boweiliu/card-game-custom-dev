import { PrefixedId } from "@/shared/types/id-prefixes";


const PREFIXES = {
  // DB
  PROTOCARD_ENTITY: 'pce_',
  PROTOCARD_VERSION: 'pcv_',
  PROTOCARD_SNAPSHOT: 'pcs_',
  // Client
  PROTOCARD_ENTITY_CLIENT: 'pcf_',
  PROTOCARD_VERSION_CLIENT: 'pcw_',
  PROTOCARD_SNAPSHOT_CLIENT: 'pct_',
}

export type ProtocardEntityId = PrefixedId<typeof PREFIXES.PROTOCARD_ENTITY>;
export type ProtocardVersionId = PrefixedId<typeof PREFIXES.PROTOCARD_VERSION>;
export type ProtocardSnapshotId = PrefixedId<typeof PREFIXES.PROTOCARD_SNAPSHOT>;
export type ProtocardEntityClientId = PrefixedId<typeof PREFIXES.PROTOCARD_ENTITY_CLIENT>;
export type ProtocardVersionClientId = PrefixedId<typeof PREFIXES.PROTOCARD_VERSION_CLIENT>;
export type ProtocardSnapshotClientId = PrefixedId<typeof PREFIXES.PROTOCARD_SNAPSHOT_CLIENT>;

export type ProtocardEntityOrder = (number | string) & { __protocard_entity_order: true };
export type ProtocardVersionOrder = (number | string) & { __protocard_version_order: true };
export type ProtocardSnapshotOrder = (number | string) & { __protocard_snapshot_order: true };
export type ProtocardEntityClientOrder = (number | string) & { __protocard_entity_client_order: true };
export type ProtocardVersionClientOrder = (number | string) & { __protocard_version_client_order: true };
export type ProtocardSnapshotClientOrder = (number | string) & { __protocard_snapshot_client_order: true };
