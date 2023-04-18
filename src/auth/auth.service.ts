import { Injectable } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './dto/index';
import {
  BadRequest,
  ConfilctRequest,
  Created,
  Fobidden,
  InternalServerError,
  NotFound,
  Ok,
} from '../response';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import {
  AuthenticatedRequest,
  DecodedUser,
  JwtService,
} from '../jwt/jwt.service';
import { AuthRepository } from './auth.repository';
import { KeyTokenService } from './keyToken.service';
import { KeyTokenRepository } from './keyToken.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly keyTokenService: KeyTokenService,
    private readonly keyTokenRepository: KeyTokenRepository,
  ) {}

  async register(body: RegisterDTO) {
    const { email, password } = body;
    const userExist = await this.authRepository.findUserByEmail(email);

    if (userExist) {
      throw new ConfilctRequest('Email is already Exist in System!');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    body = { ...body, password: hashPassword };

    const newUser = await this.authRepository.createNewUser(body);

    if (newUser) {
      const { privateKey, publicKey } = this.generatePrivatePublicKey();

      const { accessToken, refreshToken } =
        await this.jwtService.createTokenPair(
          {
            id: newUser.id,
            email: newUser.email,
          },
          privateKey,
        );

      const keyToken = {
        userId: newUser.id,
        publicKey,
        privateKey,
        refreshToken,
      };
      await this.keyTokenService.createKeyToken(keyToken);

      const { password, ...infor } = newUser;

      const metaData = {
        refreshToken,
        response: new Created({ user: infor, token: accessToken }, 'Success'),
      };

      return metaData;
    } else throw new InternalServerError('DB error!');
  }

  async login(body: LoginDTO) {
    const { email, password } = body;

    const userEixst = await this.authRepository.findUserByEmail(email);
    if (!userEixst)
      throw new NotFound(
        'Email not register, Please register to using System!',
      );

    const isValid = await bcrypt.compare(password, userEixst.password);
    if (!isValid) throw new BadRequest('Wrong password!');

    const { privateKey, publicKey } = this.generatePrivatePublicKey();
    const payload = {
      id: userEixst.id,
      email: userEixst.email,
    };

    const { accessToken, refreshToken } = this.jwtService.createTokenPair(
      payload,
      privateKey,
    );

    delete userEixst.password;

    const keyToken = {
      userId: userEixst.id,
      publicKey,
      privateKey,
      refreshToken,
    };
    await this.keyTokenService.createKeyToken(keyToken);

    const metaData = {
      refreshToken,
      response: new Created({ user: userEixst, token: accessToken }, 'Success'),
    };

    return metaData;
  }

  async refreshToken(req: AuthenticatedRequest) {
    // const token = req.cookies.refreshToken;
    const token = req.body.refreshToken;
    if (!token) throw new Fobidden('UnAuthorization!');

    const clientId = req.headers['x-client-id'];
    if (!clientId) throw new BadRequest('Missing header value!');
    const userId = Number(clientId);

    const foundToken = await this.keyTokenRepository.findByRefreshTokenUsed(
      token,
    );
    // If token is used then user have to login again
    if (foundToken) {
      // logout
      const decoded = await this.jwtService.verifyRefreshToken(
        token,
        foundToken.publicKey,
      );
      console.log(`User using this refreshToken is ${decoded.email}`);

      await this.keyTokenRepository.deleteByUserId(userId);

      throw new Fobidden('Some thing went wrong, please reLogin!');
    }

    const keyToken = await this.keyTokenRepository.findByToken(token);
    if (!keyToken) throw new NotFound('User not found!');

    const decoded = await this.jwtService.verifyRefreshToken(
      token,
      keyToken.publicKey,
    );

    if (decoded.id !== userId) throw new Fobidden('Invalid Token!');

    const payload = { id: decoded.id, email: decoded.email };
    const { accessToken, refreshToken } = await this.jwtService.createTokenPair(
      payload,
      keyToken.privateKey,
    );

    const keyTokenUpdate = await this.keyTokenRepository.update(
      token,
      refreshToken,
    );
    if (!keyTokenUpdate) throw new InternalServerError('DB error!');

    const metaData = {
      refreshToken,
      response: new Ok({ token: accessToken }, 'Success!'),
    };

    return metaData;
  }

  async logout(userId: number, user: DecodedUser) {
    const userFound = await this.authRepository.findByUserId(userId);
    if (!userFound) throw new BadRequest('User not found!');
    if (userFound.email !== user.email) throw new Fobidden('Invalid Token!');

    const keyToken = await this.keyTokenRepository.findByUserId(userId);
    if (!keyToken) throw new BadRequest('User not login!');

    await this.keyTokenRepository.deleteByUserId(userId);
    return new Ok(null, 'Logut success!');
  }

  async forgotPassowrd(email: string) {
    const userExist = await this.authRepository.findUserByEmail(email);
    if (!userExist) throw new NotFound('User not found!');

    // sendMail
  }

  async verifyEmail(email: string) {}

  generatePrivatePublicKey = () => {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    });
  };
}
