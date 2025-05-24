import { Router } from 'express';
import { DatabaseRepository } from '@/server/db/repository';
import { asyncHandler } from '@/server/middleware/async-handler';
import {
  PingRequest,
  PingResponse,
  CountRequest,
  CountResponse,
} from '@/shared/types/api';
import { noBodyValidator } from '@/server/routes/validators/input';

export function createMiscRoutes(repository: DatabaseRepository): Router {
  const router = Router();

  // Ping endpoint
  router.get(
    '/ping',
    asyncHandler({
      validator: async (inData: unknown, params: unknown, req: unknown) => {
        return [inData as PingRequest, {}];
      },
      routeFn: async (
        props: PingRequest,
        params: {}
      ): Promise<PingResponse> => {
        const { delay = 0 } = props;
        console.log(`Ping endpoint called with ${delay}s delay`);
        await new Promise((resolve) =>
          setTimeout(resolve, Math.max(delay, 0) * 1000)
        );
        return {};
      },
      responseType: 'api.ping',
    })
  );

  // Count endpoint - records each call in SQLite
  router.post(
    '/count',
    asyncHandler({
      validator: noBodyValidator,
      routeFn: async (
        validatedData: void,
        params: {}
      ): Promise<CountResponse> => {
        const result = await repository.insertCountCall();
        console.log(`Count endpoint called. Total calls: ${result.total}`);
        return {
          total: result.total,
        };
      },
      responseType: 'api.count',
    })
  );

  return router;
}
