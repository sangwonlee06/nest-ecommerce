import { Role } from '../../user/entities/role.enum';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { RequestWithUserInterface } from '../interfaces/requestWithUser.interface';

export const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends AccessTokenGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);
      const req = context.switchToHttp().getRequest<RequestWithUserInterface>();
      const user = req.user;

      return user.roles.includes(role);
    }
  }
  return mixin(RoleGuardMixin);
};
