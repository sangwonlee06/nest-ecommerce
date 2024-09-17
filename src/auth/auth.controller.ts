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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignInUserDto } from '../user/dto/signin-user.dto';
import { UserService } from '../user/user.service';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  @ApiBody({
    type: CreateUserDto,
    description: 'Data required to create a new user account.',
  })
  @ApiOperation({
    summary: 'User Sign-Up',
    description: 'Registers a new user with an email and password.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  @ApiBody({
    type: SignInUserDto,
    description: 'User email and password for authentication.',
  })
  @ApiOperation({
    summary: 'User Sign-In',
    description: 'Authenticates a user with email and password.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in and JWT token generated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User not found or incorrect credentials.',
  })
  async signIn(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    // const token = await this.authService.generateAccessToken(user.id);
    // return { user, token };
    const accessTokenCookie = await this.authService.generateAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      await this.authService.generateRefreshToken(user.id);

    // Set the Set-Cookie header to store both the access token and refresh token
    await this.userService.storeRefreshTokenInRedis(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({
    summary: 'Get User Info',
    description: 'Retrieves the currently logged-in user’s information.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Access token is missing or invalid.',
  })
  async getUserInfo(@Req() req: RequestWithUserInterface) {
    return await req.user;
  }

  @Post('/send-email-verification')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email to send verification.',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Send Email Verification',
    description:
      'Sends an email with a verification code to the specified email address.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email address.',
  })
  async sendEmailVerification(@Body('email') email: string) {
    return await this.authService.sendEmailVerification(email);
  }

  @Post('/verify-email')
  @ApiBody({
    type: EmailVerificationDto,
    description: 'User email and the verification code sent to their inbox.',
  })
  @ApiOperation({
    summary: 'Verify Email Code',
    description: 'Verifies the email using the provided verification code.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Wrong or expired verification code.',
  })
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmailCode(emailVerificationDto);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  @ApiOperation({
    summary: 'Google Sign-In',
    description: 'Redirects the user to Google for authentication.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirected to Google for authentication.',
  })
  async googleSignIn() {
    return HttpStatus.OK;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  @ApiOperation({
    summary: 'Google Sign-In Callback',
    description:
      'Handles the callback after Google authentication and issues a JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Google authentication successful. JWT token generated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Google authentication failed.',
  })
  async googleSignInCallback(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    const accessTokenCookie = await this.authService.generateAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      await this.authService.generateRefreshToken(user.id);
    await this.userService.storeRefreshTokenInRedis(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Post('/signout')
  @ApiOperation({
    summary: 'User Sign-Out',
    description:
      'Signs the user out by removing the refresh token and clearing the sign-in cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sign-out successful. Cookies cleared.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Sign-out failed.',
  })
  @ApiBearerAuth()
  async signOut(@Req() req: RequestWithUserInterface) {
    await this.userService.removeRefreshTokenFromRedis(req.user.id);
    req.res.setHeader(
      'Set-Cookie',
      this.authService.generateCookiesForSignOut(),
    );
    return true;
  }

  @UseGuards(RefreshTokenGuard)
  @Get('token/refresh')
  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Generates a new access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Access token successfully refreshed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid or expired refresh token.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error. Could not refresh the access token.',
  })
  async refreshAccessToken(@Req() req: RequestWithUserInterface) {
    const accessTokenCookie = await this.authService.generateAccessToken(
      req.user.id,
    );

    req.res.setHeader('Set-Cookie', accessTokenCookie);

    return req.user;
  }
}
