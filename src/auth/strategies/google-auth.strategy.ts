import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('GOOGLE_AUTH_CLIENTID'),
      clientSecret: configService.get('GOOGLE_AUTH_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_AUTH_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { provider, displayName, email, picture } = profile;

    try {
      // If the user exists, return the user from the database
      const user = await this.userService.getUserByEmail(email);

      if (user.authProvider !== provider) {
        throw new HttpException(
          `Your account is already linked with ${user.authProvider}`,
          HttpStatus.CONFLICT,
        );
      }
      done(null, user);
    } catch (err) {
      // If the user doesn't exist, proceed with registration
      if (err.status === 404) {
        const newUser = await this.userService.createUser({
          email,
          username: displayName,
          authProvider: provider,
          profileImg: picture,
        });
        done(null, newUser);
      }
    }
  }
}
