import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import LoginDto from './dto/login.dto';
import { catchError, throwError } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
@Controller('api/auth')
export class AuthController {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.client
      .send({ cmd: 'login' }, body)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.client
      .send({ cmd: 'register' }, body)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
