import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInUserDto } from '../user/dto/signin-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async createUser(createUserDto: CreateUserDto) {
    // Password encryption
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    // const newUser = await this.userService.createUser({
    //   ...createUserDto,
    //   password: hashedPassword,
    // });
    // return newUser;

    // Omit the password field in the response
    const newUser = await this.userService.createUser(createUserDto);
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
}
