import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { KeyTokenService } from './keyToken.service';
import { JwtModule } from '../jwt/jwt.module';
import { AuthRepository } from './auth.repository';
import { KeyTokenRepository } from './keyToken.repository';
@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, KeyTokenService, AuthRepository, KeyTokenRepository],
})
export class AuthModule {}
