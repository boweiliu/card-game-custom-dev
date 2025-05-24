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
      default:
        console.log('[SSE] Unknown event type:', event.type);
    }
  }
}

// Export singleton instance
export const sseService = new SSEService();
