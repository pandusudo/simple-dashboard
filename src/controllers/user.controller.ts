import { Response, Request } from 'express';
import { UserService } from '../services/user.service';
import { ResponseHandler } from '../helpers/response-handler';
import { hashWithBcrypt } from '../helpers/hash';
import { AuthService } from '../services/auth.service';
import { cookieSettings } from '../configs/cookie';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { users, metadata } = await UserService.getAll(req.query);
      ResponseHandler.success(
        res,
        200,
        'Success get all users',
        users,
        metadata
      );
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async getUserDashboard(req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getUserDashboard();
      ResponseHandler.success(res, 200, 'Success get user dashboard', users);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static getUserProfile(req: Request, res: Response): void {
    try {
      const user = req.user;
      ResponseHandler.success(res, 200, 'Success get user profile', user);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async editUser(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;
      const id = req.user.id;
      const user = await UserService.update(id, payload);
      ResponseHandler.success(res, 200, 'Success update user profile', user);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const password = req.body.password;
      const oldPassword = req.body.old_password;
      const id = req.user.id;
      const passwordIsSet = req.user.password_is_set;
      if (passwordIsSet && oldPassword) {
        await UserService.validateOldPassword(id, oldPassword);
      }
      await UserService.update(id, { password: hashWithBcrypt(password) });
      await AuthService.logout(id);
      res.clearCookie('session_id');
      ResponseHandler.success(res, 200, 'Success reset password');
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const data = await UserService.verifyEmail(
        req.body,
        req.cookies.session_id
      );
      const { hashedSessionId, user, isDifferentUser } = data;
      if (!req.cookies.session_id) {
        res.cookie('session_id', hashedSessionId, cookieSettings);
      }
      ResponseHandler.success(res, 200, 'Your email is verified!', {
        id: user.id,
        verified_at: user.verified_at,
        is_different_user: isDifferentUser,
      });
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async resendVerifyEmail(req: Request, res: Response): Promise<void> {
    try {
      await UserService.resendVerifyEmail(req.user);

      ResponseHandler.success(
        res,
        200,
        'Verification email sent. Please check your email to verify your address before using the app.'
      );
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }

  static async checkSession(req: Request, res: Response): Promise<void> {
    try {
      const result = {
        id: req.user.id,
        verified_at: req.user.verified_at,
        expiry_date: req.session.expired_at,
      };

      ResponseHandler.success(res, 200, 'Your session is active', result);
    } catch (error) {
      ResponseHandler.handleErrors(res, error);
    }
  }
}
