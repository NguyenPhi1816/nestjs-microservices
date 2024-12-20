import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import LoginDto from './dto/login.dto';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordByPhoneNumberDto } from './dto/update-password-by-phone-number.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  login(data: LoginDto): any {
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'login-admin' })
  loginAdmin(data: LoginDto): any {
    return this.authService.loginAdmin(data);
  }

  @MessagePattern({ cmd: 'register' })
  register(data: RegisterDto): any {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'update-password' })
  updatePassword(data: {
    userId: number;
    requestBody: UpdatePasswordDto;
  }): any {
    return this.authService.updatePassword(data.userId, data.requestBody);
  }

  @MessagePattern({ cmd: 'update-password-by-phone-number' })
  updatePasswordByPhoneNumber(data: UpdatePasswordByPhoneNumberDto): any {
    return this.authService.updatePasswordByPhoneNumber(data);
  }
}
