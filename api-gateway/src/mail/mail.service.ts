import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import ProfileResult from 'src/order/dto/profile-result.dto';

@Injectable()
export class MailService {
  private mailClient: ClientProxy;
  private userClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.mailClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('MAIL_SERVICE_HOST'),
        port: configService.get('MAIL_SERVICE_PORT'),
      },
    });
    this.userClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('USER_SERVICE_HOST'),
        port: configService.get('USER_SERVICE_PORT'),
      },
    });
  }

  async sendOtp(phoneNumber: string) {
    const user: ProfileResult = await firstValueFrom(
      this.userClient
        .send({ cmd: 'get-profile-by-phone-number' }, phoneNumber)
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );

    if (!user) {
      throw new NotFoundException(
        'Không tìm thấy người dùng với số điện thoại ' + phoneNumber,
      );
    }

    return this.mailClient.send({ cmd: 'send-otp' }, user.email);
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const user: ProfileResult = await firstValueFrom(
      this.userClient
        .send({ cmd: 'get-profile-by-phone-number' }, phoneNumber)
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );

    if (!user) {
      throw new NotFoundException('OTP không hợp lệ');
    }

    return this.mailClient.send(
      { cmd: 'verify-otp' },
      { email: user.email, otp },
    );
  }
}
