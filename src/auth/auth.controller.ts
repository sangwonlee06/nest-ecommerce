import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInUserDto } from '../user/dto/signin-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUserInterface } from './interfaces/requestWithUser.interface';

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
}
