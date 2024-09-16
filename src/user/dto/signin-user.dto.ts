import { ApiProperty } from '@nestjs/swagger';

export class SignInUserDto {
  @ApiProperty({
    example: 'example@example.com',
    description: "The user's email address",
  })
  email: string;

  @ApiProperty({ example: 'Password123!', description: "The user's password" })
  password: string;
}
