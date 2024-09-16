import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from './entities/role.enum';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RoleGuard(Role.ADMIN))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Users',
    description: 'API to retrieve information for all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. No valid authentication token provided.',
  })
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }
}
