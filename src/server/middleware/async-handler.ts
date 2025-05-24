import { SuccessResponse, MessageID } from '@/shared/types/responses';
import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler<InT, OutT, ParamsT> = (
  validatedData: InT,
  params: ParamsT
) => Promise<OutT>;

// Wrapper to catch async errors and handle returned data
export function asyncHandler<InT, OutT, ParamsT>(fns: {
  validator: (inData: unknown, params: unknown, req: unknown) => Promise<[InT, ParamsT]>;
  routeFn: AsyncRouteHandler<InT, OutT, ParamsT>;
  responseType: string;
}) {
  const { validator, routeFn, responseType } = fns;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // prefer using body over query
      const { body, query } = req;
      const hasBody =
        body && typeof body === 'object' && Object.keys(body).length > 0;
      const rawData = hasBody ? body : query;
      const rawParams = req.params;
      const [requestData, params] = await validator(rawData, rawParams, req);
      const result = await routeFn(requestData, params);

      // Extract request ID if present
      const requestId: MessageID | undefined = (requestData && typeof requestData === 'object' && 'id' in requestData && typeof requestData.id === 'string') 
        ? (requestData as any).id as MessageID
        : undefined;

      // wrap result in transport
      const response: SuccessResponse<OutT> = {
        id: requestId,
        success: true,
        type: responseType,
        result: result,
        meta: {
          timestamp: new Date().toISOString(),
          params: [ requestData, params ],
        },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
