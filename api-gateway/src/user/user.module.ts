import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'USER_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('USER_SERVICE_HOST'),
            port: configService.get('USER_SERVICE_PORT'),
          },
        });
      },
    },
    {
      provide: 'MEDIA_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('MEDIA_SERVICE_HOST'),
            port: configService.get('MEDIA_SERVICE_PORT'),
          },
        });
      },
    },
  ],
})
export class UserModule {}
