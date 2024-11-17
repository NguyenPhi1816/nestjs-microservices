import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import LoginDto from './dto/login.dto';
import { catchError, map, throwError } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import AuthResponseDto from './dto/auth-response.dto';
import TokenResponseDto from './dto/token-response.dto';
import { AccessTokenGuard } from './guard/access-token.guard';
import { GetUser } from './decorator/get-user.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordByPhoneNumberDto } from './dto/update-password-by-phone-number.dto';

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

  @HttpCode(HttpStatus.OK)
  @Put('update-password')
  @UseGuards(AccessTokenGuard)
  updatePassword(
    @GetUser('id') userId: number,
    @Body() requestBody: UpdatePasswordDto,
  ) {
    return this.client
      .send({ cmd: 'update-password' }, { userId, requestBody })
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @HttpCode(HttpStatus.OK)
  @Put('update-password-by-phone')
  updatePasswordByPhoneNumber(
    @Body() requestBody: UpdatePasswordByPhoneNumberDto,
  ) {
    return this.client
      .send({ cmd: 'update-password-by-phone-number' }, requestBody)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
