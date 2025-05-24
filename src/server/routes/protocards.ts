import { Router } from 'express';
import { DatabaseRepository } from '@/server/db/repository';
import { asyncHandler } from '@/server/middleware/async-handler';
import { noBodyValidator, protocardValidator } from '@/server/validators/validators';
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
      routeFn: async (
        validatedData: CreateProtocardRequest,
        params: {}
      ): Promise<CreateProtocardResponse> => {
        const { text_body } = validatedData;
        const result = await repository.createProtocord(text_body);
        return {
          id: result.id,
          text_body: result.text_body,
          message: 'Protocard created successfully',
        };
      },
    })
  );

  // Update protocard
  router.put(
    '/:id',
    asyncHandler({
      validator: protocardValidator,
      routeFn: async (
        validatedData: UpdateProtocardRequest,
        params: ProtocardParams
      ): Promise<UpdateProtocardResponse> => {
        const { id } = params;
        const { text_body } = validatedData;
        const result = await repository.updateProtocord(
          parseInt(id),
          text_body
        );
        return {
          id: result.id,
          text_body: result.text_body,
          message: 'Protocard updated successfully',
        };
      },
    })
  );

  // Delete protocard
  router.delete(
    '/:id',
    asyncHandler({
      validator: noBodyValidator,
      routeFn: async (
        validatedData: void,
        params: ProtocardParams
      ): Promise<DeleteProtocardResponse> => {
        const { id } = params;
        await repository.deleteProtocord(parseInt(id));
        return {
          message: 'Protocard deleted successfully',
        };
      },
    })
  );

  return router;
}
