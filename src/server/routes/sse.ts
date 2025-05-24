import { Router } from 'express';
import { SSEConnectedResponse, SSEHeartbeatResponse } from '@/shared/types/sse';

export function createSSERoutes(): Router {
  const router = Router();

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
      type: "sse.connected",
      result: { message: "SSE connection established" },
      meta: { timestamp: new Date().toISOString() }
    };
    res.write(`data: ${JSON.stringify(connectedResponse)}\n\n`);

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
        type: "sse.heartbeat",
        result: { count: heartbeatCount },
        meta: { timestamp: new Date().toISOString() }
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
      clearInterval(heartbeat);
    });

    req.on('error', (error) => {
      console.error(`[SSE] Connection error:`, error);
      connectionClosed = true;
      clearInterval(heartbeat);
    });

    res.on('close', () => {
      connectionClosed = true;
      clearInterval(heartbeat);
    });

    res.on('error', (error) => {
      console.error(`[SSE] Response error:`, error);
      connectionClosed = true;
      clearInterval(heartbeat);
    });
  });

  return router;
}
