import { Injectable } from '@nestjs/common';
import { NextFunction, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequest, Fobidden, NotFound } from 'src/response';

export interface PayloadToken {
  id: number;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedUser {
  id: number;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user: DecodedUser; // replace `User` with the actual type of your `user` object
}

@Injectable()
export class JwtService {
  //   private readonly _accessKey = process.env.SECRET_ACCESS_KEY;
  //   private readonly _refreshKey = process.env.SECRET_REFRESH_KEY;
  private readonly _timeExpiresOfAccess = 900;
  private readonly _timeExpiresOfRefresh = '1 days';

  constructor(private readonly prisma: PrismaService) {}

  signAccessToken(payload: PayloadToken, privateKey: string): string {
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: this._timeExpiresOfAccess,
    });
  }

  signRefreshToken(payload: PayloadToken, privateKey: string): string {
    return jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: this._timeExpiresOfRefresh,
    });
  }

  createTokenPair(payload: PayloadToken, privateKey: string): TokenPair {
    const accessToken = this.signAccessToken(payload, privateKey);
    const refreshToken = this.signRefreshToken(payload, privateKey);
    return { accessToken, refreshToken };
  }
  async verifyAccessToken(req: AuthenticatedRequest, next: NextFunction) {
    const header: string = req.headers['authorization'];
    const idOfUser = req.headers['x-client-id'];
    if (!idOfUser) {
      throw new BadRequest('Missing request header!');
    }
    const userId = Number(idOfUser);

    if (!header) throw new Fobidden('UnAuthorization!');

    const token = header.substring(7);
    const keyToken = await this.prisma.keyToken.findUnique({
      where: { userId: userId },
    });
    if (!keyToken) throw new NotFound('User not found!');

    try {
      const decoded = jwt.verify(token, keyToken.publicKey, {
        algorithms: ['RS256'],
      });
      if (userId !== decoded.id) {
        throw new Fobidden('Invalid token!');
      }

      req.user = decoded;

      return next();
    } catch (err) {
      console.log(err);
      throw new Fobidden('Invalid Token!');
    }
  }

  verifyRefreshToken(token: string, publicKey: any) {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
    });
    return decoded;
  }
}
