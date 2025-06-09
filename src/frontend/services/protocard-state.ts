import { protocardApi } from '@/frontend/api/protocards';
import { ProtocardId } from '@/shared/types/id-prefixes';
import { ProtocardTransport, ProtocardTransportType } from '@/shared/types/api';
import { MessageID } from '@/shared/types/responses';
import { SyncableState } from '@/frontend/services/SyncableState';
import { PrefixedId } from '@/shared/types/id-prefixes';
import { IDGenerator } from '@/shared/types/id-prefixes';
import { ID_PREFIXES } from '@/shared/types/id-prefixes';

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
 * ---
 * BUT in the client-side application, we shouldn't need to know about any of that, we can work with models and 
 * updating them and querying the clientRepo for whether things are synced or not. 
 * An intermediate layer should break apart the updates into idempotent bits, with order, and surface conflicts,
 * and handle retries and error states etc.
 */


export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ProtocardTransportId = PrefixedId<typeof ID_PREFIXES.PROTOCARD_TRANSPORT>;

export function generateTransportId(): ProtocardTransportId {
  return IDGenerator.generate(ID_PREFIXES.PROTOCARD_TRANSPORT);
}


// Frontend state representation of a protocard
export class ProtocardClientModel {
  id: ProtocardTransportId;
  data: Optional<ProtocardTransport, 'entityId' | 'type'>;
  isSynced: boolean;

  constructor() {
    this.id = generateTransportId();
    this.data = {
      textBody: '',
    };
    this.isSynced = false;
  }
}

class DataRepo {
  private records: Record<ProtocardTransportId, ProtocardClientModel> = {};

  public async create(): Promise<ProtocardClientModel> {
    const protocard = new ProtocardClientModel();
    this.records[protocard.id] = protocard;

    // TODO: start sending (and handling) the storage up to the server
    return Promise.resolve(protocard);
  }

  public get(id: ProtocardTransportId): ProtocardClientModel | undefined {
    return this.records[id];
  }

  public async update(id: ProtocardTransportId, data: Omit<ProtocardTransport, 'entityId' | 'type'>): Promise<void> {
    const protocard = this.records[id];
    if (!protocard) {
      throw new Error(`Protocard not found: ${id}`);
    }
    protocard.data = {
      ...protocard.data,
      ...data,
    };
    
    // TODO: start sending (and handling) the storage up to the server
    return Promise.resolve();
  }

  public isSynced(id: ProtocardTransportId, cb: (isSynced: boolean) => void) {
    // hmm
  }
    
}

export const protocardsRepo = new DataRepo();

async function test() {
  const protocard = await protocardsRepo.create();
  await protocardsRepo.update(protocard.id, {
    textBody: 'test',
  });
}
