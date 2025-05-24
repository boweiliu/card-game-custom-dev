import { SuccessResponse, MessageID } from '@/shared/types/responses';
import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler<InT, OutT, ParamsT> = (
  validatedData: InT,
  params: ParamsT
) => Promise<OutT>;

function extractRequestId(rawData: unknown): MessageID | undefined {
  if (!rawData || typeof rawData !== 'object' || !('id' in rawData) || typeof rawData.id !== 'string') {
    return undefined;
  }
  return (rawData as any).id as MessageID;
}

function extractData(request: Request): unknown {
  const { body, query } = request;
  const hasBody =
    body && typeof body === 'object' && Object.keys(body).length > 0;
  return hasBody ? body : query;
}

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
      const rawData = extractData(req);
      const rawParams = req.params;
      const rawRequestId: MessageID | undefined = extractRequestId(rawData);

      const [requestData, params] = await validator(rawData, rawParams, req);
      const result = await routeFn(requestData, params);

      // wrap result in transport
      const response: SuccessResponse<OutT> = {
        id: rawRequestId,
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
