import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role } from './entities/role.enum';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUserInterface } from '../auth/interfaces/requestWithUser.interface';
import { exBufferedFile } from '../minio-client/file.model';

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

  @Post('/profile/image')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Profile Image',
    description: 'API to update the profile image for the logged-in user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image file or request data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. No valid authentication token provided.',
  })
  async updateProfileImage(
    @Req() req: RequestWithUserInterface,
    @UploadedFile() image: exBufferedFile,
  ) {
    return await this.userService.updateProfileImage(req.user.id, image);
  }
}
