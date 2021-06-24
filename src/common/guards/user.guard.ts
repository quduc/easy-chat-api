import { CanActivate, ExecutionContext, HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../modules/user/user.service';
@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    @Inject('UserService')
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const dbUser = await this.userService.getUserInfoRedis(user.id);
    if(dbUser){
      request.user = dbUser
      return true
    }
    return false
    
  }
}