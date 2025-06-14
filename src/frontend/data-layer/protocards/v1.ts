// TODO: move this into generated

import { IDGenerator } from "@/shared/types/id-prefixes";
import { _PREFIXES as PREFIXES, ProtocardEntityClientId,
  ProtocardVersionClientId, ProtocardSnapshotClientId,
  ProtocardEntityClientOrder, ProtocardVersionClientOrder, ProtocardSnapshotClientOrder,
  ProtocardEntityId, ProtocardVersionId, ProtocardSnapshotId,
  ProtocardEntityOrder, ProtocardVersionOrder, ProtocardSnapshotOrder } from "@/shared/data-layer/protocards/generated/ids";
import { ProtocardContent } from "@/shared/data-layer/protocards/v1";
import { DateString } from "@/shared/types/db";

export const _generateId = () => IDGenerator.generate(PREFIXES.PROTOCARD_ENTITY_CLIENT);

export type ProtocardClientModel = Readonly<ProtocardContent> & {
  readonly id: ProtocardEntityClientId;
}

export type ProtocardClientEntity = {
  id: ProtocardEntityClientId;
  orderKey: ProtocardEntityClientOrder;
  createdAt: DateString;

  serverId: ProtocardEntityId;
  serverOrderKey: ProtocardEntityOrder;
  serverCreatedAt: DateString;
}

export type ProtocardClientVersion = {
  id: ProtocardVersionClientId;
  versionedClassname: string;
  orderKey: ProtocardVersionClientOrder;
  createdAt: DateString;

  serverId: ProtocardVersionId;
  serverOrderKey: ProtocardVersionOrder;
  serverCreatedAt: DateString;
}

export type ProtocardClientSnapshot = ProtocardContent & {
  id: ProtocardSnapshotClientId;
  orderKey: ProtocardSnapshotClientOrder;
  createdAt: DateString;
  isDeleted: boolean;

  serverId: ProtocardSnapshotId;
  serverOrderKey: ProtocardSnapshotOrder;
  serverCreatedAt: DateString;
}


// GEN: FROM protocrads/v1