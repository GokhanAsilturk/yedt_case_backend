import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import { generateToken } from '../utils/jwt';

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

class AuthController {
  static async login(req: LoginRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });

      if (!user || !(await user.validatePassword(password))) {
        ApiResponse.error(res, 'Invalid credentials', 401);
        return;
      }

      const token = generateToken(user);
      ApiResponse.success(res, { user, token });
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }

  static async register(req: RegisterRequest, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { 
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        ApiResponse.error(res, 'Username or email already exists', 400);
        return;
      }

      // Create admin user
      const user = await User.create({
        username,
        email,
        password,
        role: 'admin'  // Always create as admin
      });

      const token = generateToken(user);
      ApiResponse.success(res, { user, token }, 'Admin user registered successfully', 201);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }
}

export default AuthController;
