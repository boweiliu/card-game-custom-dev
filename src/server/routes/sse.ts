import { Router, Response } from 'express';
import {
  SSEConnectedResponse,
  SSEHeartbeatResponse,
  SSEProtocardCreatedResponse,
  SSEProtocardUpdatedResponse,
  SSEProtocardDeletedResponse,
  SSEResponse,
} from '@/shared/types/sse';
import { pubSubService } from '@/server/services/pubsub';
import {
  ProtocardCreatedEvent,
  ProtocardUpdatedEvent,
  ProtocardDeletedEvent,
} from '@/server/services/event-types';
import { transformProtocard } from '@/server/routes/validators/transport';

// Track active SSE connections
const activeConnections = new Set<Response>();

// Broadcast protocard events to all active connections
function broadcastToActiveConnections<T extends SSEResponse>(data: T): void {
  for (const res of activeConnections) {
    if (res.destroyed || !res.writable) {
      activeConnections.delete(res);
      continue;
    }

    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      console.error('[SSE] Error broadcasting to connection:', error);
      activeConnections.delete(res);
    }
  }
}

// Typed event handlers for protocard events
function handleProtocardCreated(event: ProtocardCreatedEvent): void {
  const response: SSEProtocardCreatedResponse = {
    id: undefined,
    success: true,
    type: 'sse.protocard.created',
    result: { protocard: transformProtocard(event.protocard) },
    meta: { timestamp: event.timestamp },
  };
  broadcastToActiveConnections(response);
}

function handleProtocardUpdated(event: ProtocardUpdatedEvent): void {
  const response: SSEProtocardUpdatedResponse = {
    id: undefined,
    success: true,
    type: 'sse.protocard.updated',
    result: { protocard: transformProtocard(event.protocard) },
    meta: { timestamp: event.timestamp },
  };
  broadcastToActiveConnections(response);
}

function handleProtocardDeleted(event: ProtocardDeletedEvent): void {
  const response: SSEProtocardDeletedResponse = {
    id: undefined,
    success: true,
    type: 'sse.protocard.deleted',
    result: { id: event.id },
    meta: { timestamp: event.timestamp },
  };
  broadcastToActiveConnections(response);
}

export function createSSERoutes(): Router {
  const router = Router();

  // Set up typed event listeners for protocard changes
  pubSubService.on('protocard.created', handleProtocardCreated);
  pubSubService.on('protocard.updated', handleProtocardUpdated);
  pubSubService.on('protocard.deleted', handleProtocardDeleted);

  // Server-Sent Events endpoint
  router.get('/', (req, res) => {
    const clientIP =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown';

    console.log(`[SSE] Connection from IP: ${clientIP}`);

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection event
    const connectedResponse: SSEConnectedResponse = {
      id: undefined,
      success: true,
      type: 'sse.connected',
      result: { message: 'SSE connection established' },
      meta: { timestamp: new Date().toISOString() },
    };
    res.write(`data: ${JSON.stringify(connectedResponse)}\n\n`);

    // Add this connection to active connections for database change broadcasts
    activeConnections.add(res);

    // Keep connection alive with periodic heartbeat
    let heartbeatCount = 0;
    let connectionClosed = false;

    const heartbeat = setInterval(() => {
      // Check if connection is still alive
      if (connectionClosed || res.destroyed || !res.writable) {
        clearInterval(heartbeat);
        return;
      }

      heartbeatCount++;
      const heartbeatResponse: SSEHeartbeatResponse = {
        id: undefined,
        success: true,
        type: 'sse.heartbeat',
        result: { count: heartbeatCount },
        meta: { timestamp: new Date().toISOString() },
      };
      const heartbeatData = `data: ${JSON.stringify(heartbeatResponse)}\n\n`;

      try {
        res.write(heartbeatData);
      } catch (error) {
        console.error(
          `[SSE] Error writing heartbeat to IP: ${clientIP}:`,
          error
        );
        connectionClosed = true;
        clearInterval(heartbeat);
      }
    }, 3000); // Every 3 seconds

    // Clean up on client disconnect
    req.on('close', () => {
      console.log(`[SSE] Client disconnected: ${clientIP}`);
      connectionClosed = true;
      activeConnections.delete(res);
      clearInterval(heartbeat);
    });

    req.on('error', (error) => {
      console.error(`[SSE] Connection error:`, error);
      connectionClosed = true;
      activeConnections.delete(res);
      clearInterval(heartbeat);
    });

    res.on('close', () => {
      connectionClosed = true;
      activeConnections.delete(res);
      clearInterval(heartbeat);
    });

    res.on('error', (error) => {
      console.error(`[SSE] Response error:`, error);
      connectionClosed = true;
      activeConnections.delete(res);
      clearInterval(heartbeat);
    });
  });

  return router;
}
