import { Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';

// Base interfaces with required fields for stored records
export interface IUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  tokenVersion?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin {
  id: string;
  userId: string;
  department: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent {
  id: string;
  userId: string;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Model interfaces with proper Sequelize typing
export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  id: CreationOptional<string>;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  tokenVersion: CreationOptional<number>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
  validatePassword(password: string): Promise<boolean>;
}

export interface AdminModel extends Model<InferAttributes<AdminModel>, InferCreationAttributes<AdminModel>> {
  id: CreationOptional<string>;
  userId: string;
  department: string;
  title: string;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
  user?: UserModel;
}

export interface StudentModel extends Model<InferAttributes<StudentModel>, InferCreationAttributes<StudentModel>> {
  id: CreationOptional<string>;
  userId: string;
  birthDate: Date;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
  user?: UserModel;
}

export interface CourseModel extends Model<InferAttributes<CourseModel>, InferCreationAttributes<CourseModel>> {
  id: CreationOptional<string>;
  name: string;
  description: CreationOptional<string>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export interface EnrollmentModel extends Model<InferAttributes<EnrollmentModel>, InferCreationAttributes<EnrollmentModel>> {
  id: CreationOptional<string>;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}


export interface UserCreateInput {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  tokenVersion?: number;
}

export interface AdminCreateInput {
  userId: string;
  department: string;
  title: string;
}

export interface StudentCreateInput {
  userId: string;
  birthDate: Date;
}

export interface CourseCreateInput {
  name: string;
  description: string;
}

export interface EnrollmentCreateInput {
  studentId: string;
  courseId: string;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PaginationResult<T> {
  rows: T[];
  count: number;
}
