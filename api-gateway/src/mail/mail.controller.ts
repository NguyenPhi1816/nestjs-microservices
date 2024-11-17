import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('api/otp/send')
  async sendOtp(@Body('phoneNumber') phoneNumber: string) {
    return this.mailService.sendOtp(phoneNumber);
  }

  @Post('api/otp/verify')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string,
  ) {
    return this.mailService.verifyOtp(phoneNumber, otp);
  }
}
