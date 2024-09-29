import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  login(data: LoginDto): any {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'register' })
  register(data: RegisterDto): any {
    return this.authService.register(data);
  }
}
