import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ErrorHandlerModule } from './handler/handler.module';
import { JwtModule } from './jwt/jwt.module';
import { ConfigModule } from '@nestjs/config';
import { JwtMiddleware } from './jwt/jwt.middleware';
@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ErrorHandlerModule,
    JwtModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .exclude(
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh-token', method: RequestMethod.ALL },
        // { path: 'api/v1/user/logout', method: RequestMethod.ALL },
      ) //exclude the path from the middleware
      .forRoutes('*'); //apply middleware for all routes
  }
}
