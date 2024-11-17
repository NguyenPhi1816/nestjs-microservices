import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MailModule,
    OtpModule,
  ],
})
export class AppModule {}
