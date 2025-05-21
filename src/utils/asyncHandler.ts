import { RequestHandler, Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Define a type for the controller functions that asyncHandler will wrap
type ControllerHandler<
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
> = (req: Request<P, ResB, ReqB, ReqQ>, res: Response<ResB>) => Promise<void>;

// Generic asyncHandler wrapper
const asyncHandler = <
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
>(
  fn: ControllerHandler<P, ResB, ReqB, ReqQ>
): RequestHandler<P, ResB, ReqB, ReqQ> =>
  (req: Request<P, ResB, ReqB, ReqQ>, res: Response<ResB>, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

export default asyncHandler;
