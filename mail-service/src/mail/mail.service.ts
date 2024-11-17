import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('GMAIL'),
        pass: this.configService.get('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: this.configService.get('GMAIL'),
      to,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
