import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InternalServerError } from '../response';
import { KeyTokenRepository } from './keyToken.repository';

export interface KeyToken {
  userId: number;
  publicKey: any;
  privateKey: any;
  refreshToken: string;
}

@Injectable()
export class KeyTokenService {
  constructor(private readonly keyTokenRepository: KeyTokenRepository) {}
  async createKeyToken(data: KeyToken) {
    try {
      const keyToken = {
        ...data,
        refreshTokensUsed: [],
      };
      const token = await this.keyTokenRepository.upsert(keyToken);

      if (!token) {
        throw new InternalServerError('DB error!');
      }

      return token.privateKey;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}
