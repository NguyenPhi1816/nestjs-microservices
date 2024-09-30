import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AuthResponseDto from './dto/auth-response.dto';
import { ConfigService } from '@nestjs/config';
import { AccountStatus } from 'src/constrants/enum/account-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async generateAccessToken(user: AuthResponseDto) {
    const accessSecret = this.config.get('JWT_ACCESS_SECRET');
    const accessExpire = this.config.get<number>('JWT_ACCESS_EXPIRE');

    if (user.status == AccountStatus.INACTIVE) {
      throw new ForbiddenException('Tài khoản của bạn đã bị khóa.');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: accessExpire,
      secret: accessSecret,
    });
    return accessToken;
  }
}
