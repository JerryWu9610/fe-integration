import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuthInfo } from './types';

export const CurrentUser = createParamDecorator(
  (data: keyof UserAuthInfo | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserAuthInfo;

    return data ? user?.[data] : user;
  },
); 