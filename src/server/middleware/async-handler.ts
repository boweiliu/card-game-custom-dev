import { Response as ApiResponse } from '@/shared/types/responses';
import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler<InT, OutT, ParamsT> = (
  validatedData: InT,
  params: ParamsT
) => Promise<OutT>;

// Wrapper to catch async errors and handle returned data
export function asyncHandler<InT, OutT, ParamsT>(fns: {
  validator: (inData: unknown, req: unknown) => Promise<InT>;
  routeFn: AsyncRouteHandler<InT, OutT, ParamsT>;
}) {
  const { validator, routeFn } = fns;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // prefer using body over query
      const { body, query } = req;
      const hasBody =
        body && typeof body === 'object' && Object.keys(body).length > 0;
      const rawData = hasBody ? body : query;
      const requestData = await validator(rawData, req);
      const result = await routeFn(requestData, req.params as ParamsT);

      // wrap result in transport
      const response: ApiResponse<OutT> = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  };
}
