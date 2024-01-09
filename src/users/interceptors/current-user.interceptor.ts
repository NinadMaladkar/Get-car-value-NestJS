import { NestInterceptor, ExecutionContext, CallHandler, Injectable } from '@nestjs/common';

import { UsersService } from '../users.service';
import { Observable } from 'rxjs';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersSerive: UsersService) { }

  intercept(context: ExecutionContext, handler: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (!request) return;
    const { userId } = request.session;

    if (userId) {
      const user = this.usersSerive.findOne(userId)
      request.currentUser = user;
    }
    return handler.handle();
  }
}