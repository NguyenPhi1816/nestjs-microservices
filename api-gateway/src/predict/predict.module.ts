import { Module } from '@nestjs/common';
import { PredictController } from './predict.controller';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PredictController],
  providers: [
    ConfigService,
    {
      provide: 'PREDICTION_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('PREDICTION_SERVICE_HOST'),
            port: configService.get('PREDICTION_SERVICE_PORT'),
          },
        });
      },
    },
  ],
})
export class PredictModule {}
