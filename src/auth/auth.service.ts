import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';

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
}
