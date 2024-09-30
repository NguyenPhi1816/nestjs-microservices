import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, map, throwError } from 'rxjs';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';

@Controller('api/users')
export class UserController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@GetUser('id') userId: number) {
    return this.client
      .send({ cmd: 'get-profile' }, userId)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
