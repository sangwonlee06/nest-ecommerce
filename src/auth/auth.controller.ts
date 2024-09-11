import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInUserDto } from '../user/dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @Post('/signin')
  async signIn(@Body() signInUserDto: SignInUserDto) {
    const user = await this.authService.signIn(signInUserDto);
    const token = await this.authService.generateAccessToken(user.id);
    return { user, token };
  }
}
