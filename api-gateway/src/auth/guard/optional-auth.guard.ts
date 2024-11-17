import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      request.user = null;
      return true;
    }

    try {
      const token = authHeader.split(' ')[1];
      // Verify the token using the secret fetched from ConfigService
      const user = await this.jwtService.verifyAsync(token, {
        secret: this.jwtSecret,
      });
      request.user = user;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
  }
}
