import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUserInterface } from './interfaces/requestWithUser.interface';
import { AccessTokenGuard } from './guards/access-token.guard';
import { EmailVerificationDto } from '../user/dto/email-verification.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  // On login request -> passport (local strategy) -> authService -> queries user table and returns result
  // @UseGuards(LocalAuthGuard)
  // @Post('/signin')
  // async signIn(@Body() signInUserDto: SignInUserDto) {
  //   const user = await this.authService.signIn(signInUserDto);
  //   const token = await this.authService.generateAccessToken(user.id);
  //   return { user, token };
  // }

  // On login request -> passport (local strategy) -> authService -> queries user table and returns result
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signIn(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getUserInfo(@Req() req: RequestWithUserInterface) {
    return await req.user;
  }

  @Post('/send-email-verification')
  async sendEmailVerification(@Body('email') email: string) {
    return await this.authService.sendEmailVerification(email);
  }

  @Post('/verify-email')
  async verifyEmail(
    //@Body('email') email: string, @Body('code') code: string
    @Body() emailVerificationDto: EmailVerificationDto,
  ) {
    return await this.authService.verifyEmailCode(emailVerificationDto);
  }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async googleSignIn() {
    return HttpStatus.OK;
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleSignInCallback(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
  }
}
