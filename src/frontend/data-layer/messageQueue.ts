import { FrontendItem } from './types';

// Interface for the message queue

export interface MessageQueue {
    sendMessage(message: FrontendItem): Promise<{ ackId: string }>;
    retryMessage(id: string | number): Promise<void>;
}
