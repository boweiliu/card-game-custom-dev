import { ApiResponse } from '@/shared/types/responses';
import { API_PATHS_FRONTEND } from '@/shared/routes';
import { validateSSEResponse } from '@/frontend/validation/api';

class SSEService {
  private eventSource: EventSource | null = null;
  private isConnected: boolean = false;

  public connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    console.log('[SSE] Connecting to server...');
    this.eventSource = new EventSource(API_PATHS_FRONTEND.sse());

    this.eventSource.onopen = () => {
      console.log('[SSE] Connected');
      this.isConnected = true;
    };

    this.eventSource.onmessage = (event) => {
      try {
        const rawResponse: unknown = JSON.parse(event.data);
        const data: ApiResponse<unknown> = validateSSEResponse(rawResponse);
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

  private handleEvent(event: ApiResponse<unknown>): void {
    switch (event.type) {
      case 'sse.connected':
        console.log('[SSE] Server connection confirmed');
        break;
      case 'sse.heartbeat':
        // Heartbeats are silent - no logging needed
        break;
      case 'sse.protocard.created':
        this.handleProtocardCreated(event as any);
        break;
      case 'sse.protocard.updated':
        this.handleProtocardUpdated(event as any);
        break;
      case 'sse.protocard.deleted':
        this.handleProtocardDeleted(event as any);
        break;
      default:
        console.log('[SSE] Unknown event type:', event.type);
    }
  }

  private handleProtocardCreated(event: any): void {
    console.log('[SSE] Protocard created:', event.result?.protocard);
    // Emit custom event that the state manager can listen to
    this.emitProtocardEvent('protocard.created', event.result?.protocard);
  }

  private handleProtocardUpdated(event: any): void {
    console.log('[SSE] Protocard updated:', event.result?.protocard);
    this.emitProtocardEvent('protocard.updated', event.result?.protocard);
  }

  private handleProtocardDeleted(event: any): void {
    console.log('[SSE] Protocard deleted:', event.result?.id);
    this.emitProtocardEvent('protocard.deleted', { id: event.result?.id });
  }

  private emitProtocardEvent(type: string, data: any): void {
    // Emit a custom DOM event that the state manager can listen to
    const customEvent = new CustomEvent('sse-protocard-event', {
      detail: { type, data },
    });
    window.dispatchEvent(customEvent);
  }
}

// Export singleton instance
export const sseService = new SSEService();
