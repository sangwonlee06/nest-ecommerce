import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Request } from 'express';
import { TokenPayloadInterface } from '../interfaces/tokenPayload.interface';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.Refresh;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get('JWT_REFRESHTOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayloadInterface) {
    const refreshToken = req.cookies?.Refresh;
    return await this.userService.validateUserRefreshToken(
      refreshToken,
      payload.userId,
    );
  }
}
