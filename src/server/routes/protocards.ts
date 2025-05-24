import { Router } from 'express';
import { DatabaseRepository } from '@/server/db/repository';
import { asyncHandler } from '@/server/middleware/async-handler';
import { 
  noBodyValidator, 
  protocardValidator,
  protocardWithParamsValidator,
  deleteProtocardValidator
} from '@/server/validators/validators';
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

export function createProtocardRoutes(repository: DatabaseRepository): Router {
  const router = Router();

  // Get all protocards
  router.get(
    '/',
    asyncHandler({
      validator: noBodyValidator,
      responseType: 'api.protocards.getAll',
      routeFn: async (
        validatedData: void,
        params: {}
      ): Promise<GetAllProtocardsResponse> => {
        const protocards = await repository.getAllProtocards();
        return protocards;
      },
    })
  );

  // Get protocards count
  router.get(
    '/count',
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
    '/',
    asyncHandler({
      validator: protocardValidator,
      responseType: 'api.protocards.create',
      routeFn: async (
        validatedData: CreateProtocardRequest,
        params: {}
      ): Promise<CreateProtocardResponse> => {
        const { text_body } = validatedData;
        const result = await repository.createProtocord(text_body);
        return result;
      },
    })
  );

  // Update protocard
  router.put(
    '/:entityId',
    asyncHandler({
      validator: protocardWithParamsValidator,
      responseType: 'api.protocards.update',
      routeFn: async (
        validatedData: UpdateProtocardRequest,
        params: ProtocardParams
      ): Promise<UpdateProtocardResponse> => {
        const { entityId } = params;
        const { text_body } = validatedData;
        const result = await repository.updateProtocord(
          entityId,
          text_body
        );
        return result;
      },
    })
  );

  // Delete protocard
  router.delete(
    '/:entityId',
    asyncHandler({
      validator: deleteProtocardValidator,
      responseType: 'api.protocards.delete',
      routeFn: async (
        validatedData: {},
        params: ProtocardParams
      ): Promise<DeleteProtocardResponse> => {
        const { entityId } = params;
        await repository.deleteProtocord(entityId);
        return {
          entityId: entityId,
        };
      },
    })
  );

  return router;
}
