import { protocardApi } from '@/frontend/api/protocards';
import { ProtocardTransport, ProtocardTransportType } from '@/shared/types/api';
import { MessageID } from '@/shared/types/responses';
import { SyncableState } from '@/frontend/services/SyncableState';
import { 
  ProtocardSnapshotClientId,
  ProtocardEntityClientId,
  ID_PREFIXES_V2,
  ProtocardEntityClientOrder,
  ProtocardSnapshotClientOrder,
  ProtocardEntityId,
  ProtocardEntityOrder,
  } from '@/shared/types/id-prefixes-v2';
import { IDGenerator, ProtocardSnapshotId, ProtocardSnapshotOrder } from '@/shared/types/id-prefixes';
import { DateString } from '@/shared/types/db';

/**
 * CONCEPTS
 * 
 * 1. immutable data, append-only rows. that means separating out entity vs snapshot types.
 * 2. manage db-side ids and client-side ids separately (otherwise creation calls are annoying);
 *    Ambivalent on whether communication happens primarily using client side ids or backend ids, or both
 *    It kinda makes the most sense to SEND data using whichver id you control, since creation messages
 *    have to work like that (hopefully both parties know what they are talking about)
 * 3. all messages should have a request id and then be acknowledged by a ack id
 * 4. use a client-specific orderKey to resolve message out of order/being superceded. It needs
 *    to be client-specific to avoid having to deal with cross client merge conflicts (unavoidable)
 *    but ALSO keep a serverside timestamp/orderKey, cuz clients might lie
 * 5. Migrations should be able to happen client-side. hold a immutable append-only schema table as well, 
 *    which links entityid to schema version and table name. Don't migrate old data, only write
 *    new versions of it into the new schema. Code should be able to handle old versions fine.
 *    When communicating with the backend, make sure to specify version.
 * ---
 * BUT in the client-side application, we shouldn't need to know about any of that, we can work with models and 
 * updating them and querying the clientRepo for whether things are synced or not. 
 * An intermediate layer should break apart the updates into idempotent bits, with order, and surface conflicts,
 * and handle retries and error states etc.
 */


export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


// Frontend state representation of a protocard
export class ProtocardClientModel {
  readonly textBody: string;
  readonly id: ProtocardEntityClientId;

  constructor(textBody: string, id: ProtocardEntityClientId = IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_ENTITY_CLIENT)) {
    this.textBody = textBody;
    this.id = id;
  }
}

// Internal repo storage interfaces
type ProtocardEntity = Readonly<{
  id: ProtocardEntityClientId;
  orderKey: ProtocardEntityClientOrder;
  createdAt: DateString;
  isDeleted: boolean;
} & ({
  serverSynced: true;
  serverId: ProtocardEntityId;
  serverOrderKey: ProtocardEntityOrder;
  serverCreatedAt: DateString;
} | {
  serverSynced: false;
})>;

type ProtocardSnapshot = Readonly<{
  id: ProtocardSnapshotClientId;
  entityId: ProtocardEntityClientId;
  orderKey: ProtocardSnapshotClientOrder;
  createdAt: DateString;
  isDeleted: boolean;

  model: Readonly<ProtocardClientModel>;
} & ({
  serverSynced: true;
  serverId: ProtocardSnapshotId;
  serverOrderKey: ProtocardSnapshotOrder;
  serverCreatedAt: DateString;
} | {
  serverSynced: false;
})>;

class MessageQueue {

  private messages: Record<string, {
    syncId: string,
    message: { id: string | number, value: unknown },
    status: 'pending' | 'acked' | 'failed',
    failedCount: number,
    ackId?: string,
  }> = {};

  private retries: Set<string> = new Set();

  public async append(message: { id: string | number, value: unknown }) {
    const syncId = IDGenerator.generate(ID_PREFIXES_V2.SYNC_CLIENT_MESSAGE);
    this.messages[syncId] = { syncId, message, status: 'pending', failedCount: 0 };

    // try to fire it over the API
    let response;
    try {
      response = await this.api.send(message);
    } catch (e) {
      // retry later
      this.messages[syncId] = { syncId, message, status: 'failed', failedCount: 1 };
      this.retries.add(syncId);
    }

    // If successful, mark it as such
    const { ackId } = response;
    this.messages[syncId] = { syncId, message, status: 'acked', ackId, failedCount: 0 };







    
  }
}
  

class RepoMap<T extends { id: string | number }, KT extends T['id'] = T['id']> {
  private map: Record<KT, T> = {} as Record<KT, T>;
  private messageQueue: MessageQueue = new MessageQueue(); // TODO: DI

  public async get(id: KT): Promise<T | undefined> {
    return this.map[id];
  }

  public async append(value: T): Promise<void> {
    this.map[(value.id as KT)] = value;
    await this.messageQueue.append({
      id: value.id,
      value: value,
    });
  }
}

class DataRepo {
  private entityMap: RepoMap<ProtocardEntity> = new RepoMap<ProtocardEntity>();
  private snapshotMap: RepoMap<ProtocardSnapshot> = new RepoMap<ProtocardSnapshot>();
  private newestSnapshotMap: Record<ProtocardEntityClientId, ProtocardSnapshot> = {};

  public async create(data: Omit<ProtocardClientModel, 'id'>): Promise<ProtocardClientModel> {
    const entity: ProtocardEntity = {
      id: IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_ENTITY_CLIENT),
      orderKey: 1 as unknown as ProtocardEntityClientOrder, // TODO
      createdAt: new Date().toISOString() as DateString, // TODO
      isDeleted: false,
      serverSynced: false,
    };
    await this.entityMap.append(entity.id, entity);
    const snapshot: ProtocardSnapshot = {
      id: IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_SNAPSHOT_CLIENT),
      entityId: entity.id,
      orderKey: 1 as unknown as ProtocardSnapshotClientOrder, // TODO
      createdAt: new Date().toISOString() as DateString, // TODO
      isDeleted: false,
      serverSynced: false,
      model: {
        ...data,
        id: entity.id,
      },
    };
    await this.snapshotMap.append(snapshot.id, snapshot);
    this.newestSnapshotMap[entity.id] = snapshot;

    // TODO: start sending (and handling) the storage up to the server
    return snapshot.model;
  }

  public async get(id: ProtocardClientModel['id']): Promise<ProtocardClientModel | undefined> {
    const snapshot = this.newestSnapshotMap[id];
    if (!snapshot || snapshot.isDeleted) {
      return undefined;
    }
    return snapshot.model;
  }

  public async update(id: ProtocardClientModel['id'], data: Omit<ProtocardClientModel, 'id'>): Promise<ProtocardClientModel | undefined> {
    const snapshot = this.newestSnapshotMap[id];
    if (!snapshot || snapshot.isDeleted) {
      return undefined;
    }
    const updatedSnapshot: ProtocardSnapshot = {
      ...snapshot,
      id: IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_SNAPSHOT_CLIENT),
      orderKey: (~~(snapshot.orderKey) + 1) as unknown as ProtocardSnapshotClientOrder,
      createdAt: new Date().toISOString() as DateString,
      serverSynced: false,
      model: {
        ...snapshot.model,
        ...data,
      },
    };
    await this.snapshotMap.append(updatedSnapshot.id, updatedSnapshot);
    this.newestSnapshotMap[id] = updatedSnapshot;
    
    // TODO: start sending (and handling) the storage up to the server
    return updatedSnapshot.model;
  }

  public async delete(id: ProtocardClientModel['id']): Promise<ProtocardClientModel | undefined> {
    const snapshot = this.newestSnapshotMap[id];
    if (!snapshot || snapshot.isDeleted) {
      return undefined;
    }
    const updatedSnapshot: ProtocardSnapshot = {
      ...snapshot,
      id: IDGenerator.generate(ID_PREFIXES_V2.PROTOCARD_SNAPSHOT_CLIENT),
      orderKey: (~~(snapshot.orderKey) + 1) as unknown as ProtocardSnapshotClientOrder,
      createdAt: new Date().toISOString() as DateString,
      serverSynced: false,
      model: snapshot.model,
      isDeleted: true,
    };
    await this.snapshotMap.append(updatedSnapshot.id, updatedSnapshot);
    this.newestSnapshotMap[id] = updatedSnapshot;
    
    // TODO: start sending (and handling) the storage up to the server
    return snapshot.model;
  }
}

export const protocardsRepo = new DataRepo();

async function test() {
  const protocard = await protocardsRepo.create({
    textBody: 'test',
  });
  console.log(await protocardsRepo.get(protocard.id));
  await protocardsRepo.update(protocard.id, {
    textBody: 'test2',
  });
  console.log(await protocardsRepo.get(protocard.id));
  await protocardsRepo.delete(protocard.id);
  console.log(await protocardsRepo.get(protocard.id));
}
