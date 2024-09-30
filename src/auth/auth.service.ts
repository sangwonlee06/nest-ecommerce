import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInUserDto } from '../user/dto/signin-user.dto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadInterface } from './interfaces/tokenPayload.interface';
import { EmailService } from '../email/email.service';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { EmailVerificationDto } from '../user/dto/email-verification.dto';
import { AuthProvider } from '../user/entities/auth-provider.enum';
import { ChangePasswordDto } from '../user/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async createUser(createUserDto: CreateUserDto) {
    // Password encryption
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // const newUser = await this.userService.createUser({
    //   ...createUserDto,
    //   password: hashedPassword,
    // });
    // return newUser;

    // Omit the password field in the response
    const newUser = await this.userService.createUser({
      ...createUserDto,
      authProvider: AuthProvider.LOCAL,
    });
    newUser.password = undefined;
    return newUser;
  }

  async signIn(signInUserDto: SignInUserDto) {
    const user = await this.userService.getUserByEmail(signInUserDto.email);

    // getUserByEmail should already throw an exception if the user is not found
    // No need to handle a 'user not found' error here

    const isPasswordCorrect = await bcrypt.compare(
      signInUserDto.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  public generateAccessToken(userId: string) {
    // const payload: any = { userId };
    const payload: TokenPayloadInterface = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESSTOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESSTOKEN_EXPIRATION_TIME')}`,
    });
    // return token;
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESSTOKEN_EXPIRATION_TIME')}`;
  }

  public generateRefreshToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESHTOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESHTOKEN_EXPIRATION_TIME')}`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESHTOKEN_EXPIRATION_TIME')}`;
    return { cookie, token };
  }

  public generateCookiesForSignOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  // async sendEmail(email: string) {
  //   await this.emailService.sendMail({
  //     to: email,
  //     subject: 'test',
  //     text: 'test',
  //   });
  //   return 'Please check your email';
  // }

  async sendForgotPasswordEmail(email: string): Promise<string> {
    const payload: any = { email };
    const token = await this.jwtService.sign(payload, {
      secret: this.configService.get('FORGOT_PASSWORD_SECRET'),
      expiresIn: this.configService.get('FORGOT_PASSWORD_EXPIRATION_TIME'),
    });
    console.log(token);
    const url = `${this.configService.get('FRONTEND_DEFAULT_URL')}/change/password?token=${token}`;

    const text = `You requested a password reset. Please click the link below to reset your password:\n\n${url}\n\nIf you did not request this, please ignore this email.`;

    await this.emailService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      text,
    });

    return 'An email has been sent to you with instructions to reset your password.';
  }

  // async updateUserPassword(
  //   userId: string,
  //   changePasswordDto: ChangePasswordDto,
  // ): Promise<{ message: string }> {
  //   const user = await this.userService.getUserById(userId);
  //
  //   if (!user) {
  //     throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
  //   }
  //
  //   const isCurrentPasswordValid = await bcrypt.compare(
  //     changePasswordDto.currentPassword,
  //     user.password,
  //   );
  //
  //   if (!isCurrentPasswordValid) {
  //     throw new HttpException(
  //       'The current password you entered is incorrect.',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //
  //   const hashedNewPassword = await bcrypt.hash(
  //     changePasswordDto.newPassword,
  //     10,
  //   );
  //
  //   await this.userService.changePassword(userId, hashedNewPassword);
  //
  //   return { message: 'Your password has been successfully changed.' };
  // }

  public async resetPassword(changePasswordDto: ChangePasswordDto) {
    const email = await this.verifyPasswordResetToken(changePasswordDto.token);
    await this.userService.changePassword(email, changePasswordDto.password);
  }

  public async verifyPasswordResetToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('FORGOT_PASSWORD_SECRET'),
      });
      return payload.email;
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        throw new BadRequestException('token expired error');
      } else {
        throw new BadRequestException('bad confirmation token');
      }
    }
  }

  async sendEmailVerification(email: string) {
    const verificationCode = this.generateOTP();
    await this.cacheManager.set(email, verificationCode, { ttl: 300 }); // Save OTP with 5-minute expiration
    await this.emailService.sendMail({
      to: email,
      subject: 'Email Verification',
      text: `Your verification code is: ${verificationCode}`,
    });
    return 'Verification email sent. Please check your inbox.';
  }

  async verifyEmailCode(emailVerficationDto: EmailVerificationDto) {
    const { email, code } = emailVerficationDto;
    const codeFromRedis = await this.cacheManager.get(email);
    if (codeFromRedis !== code) {
      throw new BadRequestException('Wrong code provided');
    }
    await this.cacheManager.del(email);
    return 'success';
  }

  generateOTP() {
    let OTP = '';

    for (let i = 1; i <= 6; i++) {
      OTP += Math.floor(Math.random() * 10);
    }
    return OTP;
  }
}
