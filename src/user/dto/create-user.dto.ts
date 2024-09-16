import { ApiProperty } from '@nestjs/swagger';
import { AuthProvider } from '../entities/auth-provider.enum';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john doe',
    description:
      'The username of the user. Must be at least 2 characters long.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Must be at least 2 characters long' })
  username: string;

  @ApiProperty({
    example: 'example@example.com',
    description: "The user's email address",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      "The user's password. Must be at least 8 characters long and include one letter, one number, and one special character.",
    required: false, // Indicating that this field is optional
  })
  @IsString({ message: 'Value must be a string' })
  @MinLength(8, { message: 'Must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and include one letter, one number, and one special character',
  })
  password?: string;

  authProvider?: AuthProvider;
  profileImg?: string;
}
