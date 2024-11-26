import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MailModule,
    OtpModule,
    PrismaModule,
    NotificationModule,
  ],
})
export class AppModule {}
