import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: 'PRODUCT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('PRODUCT_SERVICE_HOST'),
            port: configService.get('PRODUCT_SERVICE_PORT'),
          },
        });
      },
    },
  ],
})
export class ProductModule {}
