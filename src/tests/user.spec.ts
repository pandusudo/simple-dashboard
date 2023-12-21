import Sinon from 'sinon';
import { Response, Request } from 'express';
import { UserController } from '../controllers/user.controller';
import { expect } from 'chai';

describe('Testing /users endpoint', () => {
  describe('userProfile', () => {
    const sandbox = Sinon.createSandbox();
    afterEach(() => {
      Sinon.restore();
      sandbox.restore();
    });
    let req: Request & {
      user: {
        id: number;
        name: string;
        email: string;
        verified_at: Date | null;
        password_is_set: boolean;
      };
    };

    let res: Response;

    it('should return a response if found', () => {
      req.user = {
        id: 1,
        name: 'test',
        email: 'test@mail.com',
        verified_at: null,
        password_is_set: false,
      };
      UserController.getUserProfile(req, res);

      expect(res.json).to.have.been.calledWith(req.user);
    });
  });
});
