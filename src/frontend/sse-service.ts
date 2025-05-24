import { SSEEvent } from '@/shared/types/sse';

class SSEService {
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;

  public connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log('[SSE] Connecting to server...');
    this.eventSource = new EventSource('/api/events');

    this.eventSource.onopen = () => {
      console.log('[SSE] Connected');
      this.isConnected = true;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        this.handleEvent(data);
      } catch (error) {
        console.error('[SSE] Error parsing event:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('[SSE] Connection error');
      this.isConnected = false;
    };
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
    }
  }

  public isSSEConnected(): boolean {
    return this.isConnected;
  }

  private handleEvent(event: SSEEvent): void {
    switch (event.type) {
      case 'connected':
        console.log('[SSE] Server connection confirmed');
        break;
      case 'heartbeat':
        // Heartbeats are silent - no logging needed
        break;
      default:
        console.log('[SSE] Unknown event type:', event.type);
    }
  }
}

// Export singleton instance
export const sseService = new SSEService();
