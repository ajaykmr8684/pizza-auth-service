import path from 'path';
import { readFileSync } from 'fs';
import { JwtPayload, sign } from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { RefreshToken } from '../entity/RefreshToken';
import { User } from '../entity/User';
import { Repository } from 'typeorm';

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

  /**
   * Generates Access Token
   *
   * @param payload JWT Payload
   * @returns Generated Access Token
   */
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      privateKey = readFileSync(
        path.join(__dirname, '../../certs/private.pem'),
      );
    } catch (error) {
      const err = createHttpError(500, 'Error while reading Private Key');
      throw err;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'auth-service',
    });

    return accessToken;
  }

  /**
   * Generates Refresh Token
   *
   * @param payload
   * @returns Generated Refresh Token
   */
  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: 'HS256',
      expiresIn: '1y',
      issuer: 'auth-service',
      jwtid: String(payload.id),
    });

    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; //Leap Year not considered : TODO
    //Persist Refresh Token
    const persistedRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });

    return persistedRefreshToken;
  }
}
