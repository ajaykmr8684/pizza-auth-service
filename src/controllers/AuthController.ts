import { NextFunction, Response } from 'express';
import { AuthRequest, RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';

import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
  ) {}

  //REGISTER
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

  //LOGIN
  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await this.userService.findByEmail(email);

      //If user not found
      if (!user) {
        const error = createHttpError(
          400,
          "Email or password doesn't match. Try again",
        );
        next(error);
        return;
      }

      //Compare password

      const isPasswordMatched = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordMatched) {
        const error = createHttpError(
          400,
          "Email or password doesn't match. Try again",
        );
        next(error);
        return;
      }

      //Creating cookies
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const persistedRefreshToken =
        await this.tokenService.persistRefreshToken(user);

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

      res.status(200).json({ id: user.id });
    } catch (err) {
      next(err);
    }
  }

  async self(req: AuthRequest, res: Response) {
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }
}
