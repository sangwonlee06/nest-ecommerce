import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangePasswordDto {
  // @ApiProperty({
  //   example: 'Password123!',
  //   description:
  //     "The user's current password. It must be at least 8 characters long and include at least one letter, one number, and one special character.",
  //   required: true,
  // })
  // @IsString({ message: 'Value must be a string' })
  // @MinLength(8, { message: 'Must be at least 8 characters' })
  // @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
  //   message:
  //     'Password must be at least 8 characters long and include one letter, one number, and one special character',
  // })
  // readonly currentPassword: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      "The user's new password. It must be at least 8 characters long and include at least one letter, one number, and one special character.",
    required: true,
  })
  @IsString({ message: 'Value must be a string' })
  @MinLength(8, { message: 'Must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and include one letter, one number, and one special character',
  })
  password: string;
}
