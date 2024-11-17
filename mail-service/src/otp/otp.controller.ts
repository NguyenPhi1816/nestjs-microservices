import { Controller } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @MessagePattern({ cmd: 'send-otp' })
  sendOtp(email: string) {
    return this.otpService.generateAndSendOtp(email);
  }

  @MessagePattern({ cmd: 'verify-otp' })
  verifyOtp(data: { email: string; otp: string }) {
    return this.otpService.verifyOtp(data.email, data.otp);
  }
}
