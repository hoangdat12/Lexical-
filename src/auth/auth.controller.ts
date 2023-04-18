import { Controller, Post, Body, Param, Res, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dto/index';
import { Response, response } from 'express';
import { AuthenticatedRequest } from 'src/jwt/jwt.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() body: RegisterDTO, @Res() res: Response) {
    try {
      const { refreshToken, response } = await this.authService.register(body);
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        path: '/refresh_token',
        sameSite: 'none',
        secure: true,
      });
      return response.sender(res);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    const { refreshToken, response } = await this.authService.login(body);
    console.log(refreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/refresh_token',
      sameSite: 'none',
      secure: true,
    });
    return response.sender(res);
  }

  @Post('logout/:userId')
  async longout(
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    const response = await this.authService.logout(Number(userId), user);
    return response;
  }

  @Post('/refresh-token')
  async refreshToken(
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { refreshToken, response } = await this.authService.refreshToken(req);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/refresh_token',
      sameSite: 'none',
      secure: true,
    });
    return response.sender(res);
  }
}
