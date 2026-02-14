import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

export interface ICurrentUser {
  id: string;
}

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request['user'] as ICurrentUser;

    return {
      id: user.id,
    };
  },
);
