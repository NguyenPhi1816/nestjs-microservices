import { Injectable, UnauthorizedException } from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  login(data: LoginDto) {
    if (data.phoneNumber == '1' && data.password == '2') {
      return { message: 'authenticated' };
    }
    throw new RpcException(new UnauthorizedException('Unauthenticated'));
  }
}
