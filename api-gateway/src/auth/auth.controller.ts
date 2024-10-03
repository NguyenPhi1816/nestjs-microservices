import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import LoginDto from './dto/login.dto';
import { catchError, map, throwError } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import AuthResponseDto from './dto/auth-response.dto';
import TokenResponseDto from './dto/token-response.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private client: ClientProxy,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.client.send({ cmd: 'login' }, body).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (userInfo) => {
        const accessToken = await this.authService.generateAccessToken(
          userInfo as AuthResponseDto,
        );

        const response: TokenResponseDto = {
          accessToken: accessToken,
          expires: new Date(Date.now() + 3600000),
          user: {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            image: userInfo.image,
          },
          provider: 'local',
          providerAccountId: userInfo.id,
        };

        return response;
      }),
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
