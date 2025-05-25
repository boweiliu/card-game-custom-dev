import { Protocard } from '@/server/db/types';
import { ProtocardId } from '@/shared/types/db';
import { EventEmitter } from 'events';

// Non-Error error subclass for capturing stacktraces
export class StackTraceCapture extends Error {
  constructor(message = 'Stack trace capture') {
    super(message);
    this.name = 'StackTraceCapture';
    // Remove this constructor from the stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StackTraceCapture);
    }
  }
}

// Define event payloads for each specific event type
export interface ProtocardCreatedEvent {
  type: 'protocard.created';
  protocard: Protocard;
  timestamp: string;
  stacktrace: StackTraceCapture;
}

export interface ProtocardUpdatedEvent {
  type: 'protocard.updated';
  protocard: Protocard;
  timestamp: string;
  stacktrace: StackTraceCapture;
}

export interface ProtocardDeletedEvent {
  type: 'protocard.deleted';
  id: ProtocardId;
  timestamp: string;
  stacktrace: StackTraceCapture;
}

// Typed EventEmitter wrapper for specific event types
export class TypedEventEmitter<T> extends EventEmitter {
  constructor(maxListeners = 100) {
    super();
    this.setMaxListeners(maxListeners);
  }

  typedEmit<K extends keyof T>(event: K, data: T[K]): boolean {
    return super.emit(event as string, data);
  }

  typedOn<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    return super.on(event as string, listener);
  }

  typedOff<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    return super.off(event as string, listener);
  }

  typedOnce<K extends keyof T>(event: K, listener: (data: T[K]) => void): this {
    return super.once(event as string, listener);
  }
}

// Define event maps for each domain
export interface ProtocardEvents {
  'protocard.created': ProtocardCreatedEvent;
  'protocard.updated': ProtocardUpdatedEvent;
  'protocard.deleted': ProtocardDeletedEvent;
}
