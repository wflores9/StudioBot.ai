import { Router, Request, Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthService } from '../services/auth.service';

export const authRoutes = Router();
const authService = new AuthService();

// Register user
authRoutes.post(
  '/register',
  catchAsync(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError('Missing required fields: username, email, password', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    const user = await authService.registerUser(username, email, password);

    res.status(201).json({
      status: 'success',
      data: user,
      message: 'User registered successfully',
    });
  })
);

// Login
authRoutes.post(
  '/login',
  catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Missing required fields: email, password', 400);
    }

    const result = await authService.loginUser(email, password);

    if (!result) {
      throw new AppError('Invalid email or password', 401);
    }

    res.json({
      status: 'success',
      data: result,
      message: 'Login successful',
    });
  })
);

// Get user profile
authRoutes.get(
  '/profile/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const user = await authService.getUser(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: user,
    });
  })
);

// Update profile
authRoutes.patch(
  '/profile/:userId',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    const user = await authService.updateUser(userId, updates);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: user,
      message: 'Profile updated successfully',
    });
  })
);

// Change password
authRoutes.post(
  '/:userId/change-password',
  catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      throw new AppError('Missing required fields: old_password, new_password', 400);
    }

    const success = await authService.changePassword(userId, old_password, new_password);

    if (!success) {
      throw new AppError('Old password is incorrect', 401);
    }

    res.json({
      status: 'success',
      message: 'Password changed successfully',
    });
  })
);
