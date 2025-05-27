import { Request, Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

export type TypedRequest<
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
> = Request<P, ResB, ReqB, ReqQ>;

export type TypedResponse<T = any> = Response<T>;

export type TypedRequestHandler<
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
> = RequestHandler<P, ResB, ReqB, ReqQ>;

export interface IdParams extends ParamsDictionary {
  id: string;
}

export interface PaginationQuery extends ParsedQs {
  page?: string;
  limit?: string;
}

export interface SearchQuery extends ParsedQs {
  search?: string;
}

export interface StudentCreateBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}

export interface StudentUpdateBody {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

export interface AdminCreateBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  title: string;
}

export interface AdminUpdateBody {
  firstName?: string;
  lastName?: string;
  department?: string;
  title?: string;
}

export interface CourseBody {
  name: string;
  description?: string;
}

export interface CourseParams extends ParamsDictionary {
  id: string;
}

export interface EnrollmentBody {
  studentId: string;
  courseId: string;
}

export interface EnrollmentParams extends ParamsDictionary {
  id: string;
}

export type CourseListRequest = TypedRequest<{}, any, any, PaginationQuery>;
export type CourseGetRequest = TypedRequest<CourseParams>;
export type CourseCreateRequest = TypedRequest<{}, any, CourseBody>;
export type CourseUpdateRequest = TypedRequest<CourseParams, any, Partial<CourseBody>>;

export type EnrollmentListRequest = TypedRequest<{}, any, any, PaginationQuery>;
export type EnrollmentGetRequest = TypedRequest<EnrollmentParams>;
export type EnrollmentCreateRequest = TypedRequest<{}, any, EnrollmentBody>;

export type StudentListRequest = TypedRequest<{}, any, any, PaginationQuery>;
export type StudentGetRequest = TypedRequest<IdParams>;
export type StudentCreateRequest = TypedRequest<{}, any, StudentCreateBody>;
export type StudentUpdateRequest = TypedRequest<IdParams, any, StudentUpdateBody>;

export type AdminListRequest = TypedRequest<{}, any, any, PaginationQuery>;
export type AdminGetRequest = TypedRequest<IdParams>;
export type AdminCreateRequest = TypedRequest<{}, any, AdminCreateBody>;
export type AdminUpdateRequest = TypedRequest<IdParams, any, AdminUpdateBody>;

export type RequestWithPagination = TypedRequest<{}, any, any, PaginationQuery>;
export type RequestWithId = TypedRequest<IdParams>;

export type ControllerHandler<
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
> = (req: TypedRequest<P, ResB, ReqB, ReqQ>, res: TypedResponse<ResB>) => Promise<void>;

export type AsyncHandler<
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs
> = RequestHandler<P, ResB, ReqB, ReqQ>;

export type AuthMiddleware = TypedRequestHandler<{}, any, any, any>;
