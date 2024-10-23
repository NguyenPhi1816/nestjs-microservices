import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, map, throwError } from 'rxjs';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { UpdateUserStatusReq } from './dto/update-user-status.dto';

@Controller('api/users')
export class UserController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllUser() {
    return this.client
      .send({ cmd: 'get-all-user' }, {})
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

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

  @Put('/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateUserStatus(@Body() data: UpdateUserStatusReq) {
    return this.client
      .send({ cmd: 'update-user-status' }, data)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
