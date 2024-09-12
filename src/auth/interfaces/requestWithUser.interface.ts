import { User } from '../../user/entities/user.entity';
import { Request } from 'express';
export interface RequestWithUserInterface extends Request {
  user: User; // User from local auth strategy, null if authentication fails
}
