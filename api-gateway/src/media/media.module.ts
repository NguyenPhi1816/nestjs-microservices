import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [MediaController],
  providers: [
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
export class MediaModule {}
