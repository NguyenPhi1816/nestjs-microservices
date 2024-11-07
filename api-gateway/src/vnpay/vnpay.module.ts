import { Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [VnpayController],
  providers: [
    {
      provide: 'ORDER_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('ORDER_SERVICE_HOST'),
            port: configService.get('ORDER_SERVICE_PORT'),
          },
        });
      },
    },
  ],
})
export class VnpayModule {}
