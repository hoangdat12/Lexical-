import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { KeyToken } from './keyToken.service';

@Injectable()
export class KeyTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: number) {
    return this.prisma.keyToken.findUnique({
      where: {
        userId: userId,
      },
    });
  }

  findByToken(token: string) {
    return this.prisma.keyToken.findUnique({
      where: {
        refreshToken: token,
      },
    });
  }

  findByRefreshTokenUsed(token: string) {
    return this.prisma.keyToken.findFirst({
      where: {
        refreshTokensUsed: {
          has: token,
        },
      },
    });
  }

  deleteByUserId(userId: number) {
    return this.prisma.keyToken.deleteMany({
      where: {
        userId: userId,
      },
    });
  }

  create(data: KeyToken) {
    return this.prisma.keyToken.create({
      data,
    });
  }

  upsert(data: KeyToken) {
    return this.prisma.keyToken.upsert({
      where: {
        userId: data.userId,
      },
      update: data,
      create: data,
    });
  }

  update(olderRefreshToken: string, newRefreshToken: string) {
    return this.prisma.keyToken.update({
      where: {
        refreshToken: olderRefreshToken,
      },
      data: {
        refreshToken: newRefreshToken,
        refreshTokensUsed: {
          push: olderRefreshToken,
        },
      },
    });
  }
}
