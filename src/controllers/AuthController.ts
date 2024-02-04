import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';

import { TokenService } from '../services/TokenService';

export class AuthController {
  userService: UserService;

  constructor(
    userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
  ) {
    this.userService = userService;
  }

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('New request to register a user', {
      firstName,
      lastName,
      email,
      password: '*******',
    });

    try {
      const createdUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info('User has been successfully registered', {
        id: createdUser.id,
      });

      //Creating cookies

      const payload: JwtPayload = {
        sub: String(createdUser.id),
        role: createdUser.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const persistedRefreshToken =
        await this.tokenService.persistRefreshToken(createdUser);

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(persistedRefreshToken.id),
      });

      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, //1h
        httpOnly: true,
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, //1y
        httpOnly: true,
      });

      res.status(200).json({ id: createdUser.id });
    } catch (err) {
      next(err);
    }
  }
}
