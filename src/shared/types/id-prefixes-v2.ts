import { PrefixedId } from "./id-prefixes";

// ID prefix constants
// New style
export const ID_PREFIXES_V2 = {
  // DB
  PROTOCARD_ENTITY: 'pce_',
  PROTOCARD_VERSION: 'pcv_',
  PROTOCARD_SNAPSHOT: 'pcs_',
  // Client
  PROTOCARD_ENTITY_CLIENT: 'pcf_',
  PROTOCARD_VERSION_CLIENT: 'pcw_',
  PROTOCARD_SNAPSHOT_CLIENT: 'pct_',

  // generic messages
  CLIENT: 'cl_',
  // from server to client
  SYNC_SERVER_MESSAGE: "mgs_", 
  ACK_SERVER_MESSAGE: "mga_",
  // from client to server
  SYNC_CLIENT_MESSAGE: "mgt_", 
  ACK_CLIENT_MESSAGE: "mgb_",
} as const;

export type ProtocardEntityId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_ENTITY>;
export type ProtocardVersionId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_VERSION>;
export type ProtocardSnapshotId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_SNAPSHOT>;
export type ProtocardEntityClientId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_ENTITY_CLIENT>;
export type ProtocardVersionClientId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_VERSION_CLIENT>;
export type ProtocardSnapshotClientId = PrefixedId<typeof ID_PREFIXES_V2.PROTOCARD_SNAPSHOT_CLIENT>;

export type ProtocardEntityOrder = (number | string) & { __protocard_entity_order: true };
export type ProtocardVersionOrder = (number | string) & { __protocard_version_order: true };
export type ProtocardSnapshotOrder = (number | string) & { __protocard_snapshot_order: true };
export type ProtocardEntityClientOrder = (number | string) & { __protocard_entity_client_order: true };
export type ProtocardVersionClientOrder = (number | string) & { __protocard_version_client_order: true };
export type ProtocardSnapshotClientOrder = (number | string) & { __protocard_snapshot_client_order: true };


export type ClientId = PrefixedId<typeof ID_PREFIXES_V2.CLIENT>;
export type SyncServerMessageId = PrefixedId<typeof ID_PREFIXES_V2.SYNC_SERVER_MESSAGE>;
export type AckServerMessageId = PrefixedId<typeof ID_PREFIXES_V2.ACK_SERVER_MESSAGE>;
export type SyncClientMessageId = PrefixedId<typeof ID_PREFIXES_V2.SYNC_CLIENT_MESSAGE>;
export type AckClientMessageId = PrefixedId<typeof ID_PREFIXES_V2.ACK_CLIENT_MESSAGE>;