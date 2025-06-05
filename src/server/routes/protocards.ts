import { Router } from 'express';
import { DatabaseRepository } from '@/server/db/repository';
import { asyncHandler } from '@/server/middleware/async-handler';
import { API_PATHS_BACKEND } from '@/shared/routes';
import {
  noBodyValidator,
  createProtocardValidator,
  updateProtocardValidator,
  deleteProtocardValidator,
} from '@/server/routes/validators/input';
import {
  GetAllProtocardsRequest,
  GetAllProtocardsResponse,
  GetProtocardCountRequest,
  GetProtocardCountResponse,
  CreateProtocardRequest,
  CreateProtocardResponse,
  UpdateProtocardRequest,
  UpdateProtocardResponse,
  DeleteProtocardRequest,
  DeleteProtocardResponse,
  ProtocardParams,
} from '@/shared/types/api';
import { transformProtocard } from '@/server/routes/validators/transport';

export function createProtocardRoutes(repository: DatabaseRepository): Router {
  const router = Router();

  // Get all protocards
  router.get(
    API_PATHS_BACKEND.protocards.getAll,
    asyncHandler({
      validator: noBodyValidator,
      responseType: 'api.protocards.getAll',
      routeFn: async (
        validatedData: void,
        params: {}
      ): Promise<GetAllProtocardsResponse> => {
        const protocards = await repository.getAllProtocards();
        return protocards.map(transformProtocard);
      },
    })
  );

  // Get protocards count
  router.get(
    API_PATHS_BACKEND.protocards.getCount,
    asyncHandler({
      validator: noBodyValidator,
      responseType: 'api.protocards.getCount',
      routeFn: async (
        validatedData: void,
        params: {}
      ): Promise<GetProtocardCountResponse> => {
        const count = await repository.getProtocardCount();
        return { count };
      },
    })
  );

  // Create new protocard
  router.post(
    API_PATHS_BACKEND.protocards.create,
    asyncHandler({
      validator: createProtocardValidator,
      responseType: 'api.protocards.create',
      routeFn: async (
        validatedData: CreateProtocardRequest,
        params: {}
      ): Promise<CreateProtocardResponse> => {
        const { textBody } = validatedData;
        const result = await repository.createProtocord(textBody);
        return transformProtocard(result);
      },
    })
  );

  // Update protocard
  router.put(
    API_PATHS_BACKEND.protocards.update,
    asyncHandler({
      validator: updateProtocardValidator,
      responseType: 'api.protocards.update',
      routeFn: async (
        validatedData: UpdateProtocardRequest,
        params: ProtocardParams
      ): Promise<UpdateProtocardResponse> => {
        const { entityId } = params;
        const { textBody } = validatedData;
        const result = await repository.updateProtocord(entityId, textBody);
        return transformProtocard(result);
      },
    })
  );

  // Delete protocard
  router.delete(
    API_PATHS_BACKEND.protocards.delete,
    asyncHandler({
      validator: deleteProtocardValidator,
      responseType: 'api.protocards.delete',
      routeFn: async (
        validatedData: {},
        params: ProtocardParams
      ): Promise<DeleteProtocardResponse> => {
        const { entityId } = params;
        const result = await repository.deleteProtocord(entityId);
        return result.deleted ? transformProtocard(result.deleted) : null;
      },
    })
  );

  return router;
}
