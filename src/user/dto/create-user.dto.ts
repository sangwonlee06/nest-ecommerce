import { AuthProvider } from '../entities/auth-provider.enum';

export class CreateUserDto {
  username: string;
  email: string;
  password?: string;
  authProvider?: AuthProvider;
  profileImg?: string;
}
