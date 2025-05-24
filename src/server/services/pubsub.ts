import {
  ProtocardEvents,
  TypedEventEmitter,
} from '@/server/services/event-types';

export class PubSubService {
  private static instance: PubSubService;

  // Domain-specific event emitters
  public readonly protocards = new TypedEventEmitter<ProtocardEvents>();

  public static getInstance(): PubSubService {
    if (!PubSubService.instance) {
      PubSubService.instance = new PubSubService();
    }
    return PubSubService.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  public publish<K extends keyof ProtocardEvents>(
    event: K,
    data: Omit<ProtocardEvents[K], 'type' | 'timestamp'>
  ): void {
    this.protocards.typedEmit(event, {
      ...data,
      type: event,
      timestamp: new Date().toISOString(),
    } as ProtocardEvents[K]);
  }

  public on<K extends keyof ProtocardEvents>(
    event: K,
    listener: (event: ProtocardEvents[K]) => void
  ): void {
    this.protocards.typedOn(event, listener);
  }
}

export const pubSubService = PubSubService.getInstance();
