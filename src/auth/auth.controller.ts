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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInUserDto } from '../user/dto/signin-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
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
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
  }
}
