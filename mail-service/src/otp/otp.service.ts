import { BadRequestException, Injectable } from '@nestjs/common';
import * as otpGenerator from 'otp-generator';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class OtpService {
  private otps = new Map();

  constructor(
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async generateAndSendOtp(email: string) {
    try {
      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      this.otps.set(email, otp);
      setTimeout(
        () => this.otps.delete(email),
        this.configService.get<number>('EXPIRE_TIME'),
      );

      await this.mailService.sendMail(
        email,
        'Your OTP Code',
        `Your OTP code is ${otp}`,
      );
      return { status: 200, message: 'OTP sent to email' };
    } catch (error) {
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = this.otps.get(email);
    if (storedOtp !== otp) {
      throw new BadRequestException(`Invalid OTP`);
    }
    this.otps.delete(email);
    return { status: 200, message: 'OTP verified' };
  }
}
