import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreatePromotionDto from './dto/create-promotion.dto';
import { catchError, map, throwError } from 'rxjs';

@Injectable()
export class PromotionService {
  private promotionClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.promotionClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PROMOTION_SERVICE_HOST'),
        port: configService.get('PROMOTION_SERVICE_PORT'),
      },
    });
  }

  async createPromotion(data: CreatePromotionDto) {
    return this.promotionClient.send({ cmd: 'create-promotion' }, data).pipe(
      catchError((error) => {
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getPromotions() {
    return this.promotionClient.send({ cmd: 'get-promotions' }, {}).pipe(
      catchError((error) => {
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getPromotionById(id: number) {
    return this.promotionClient
      .send({ cmd: 'get-promotion-by-id' }, { promotionId: id })
      .pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      );
  }
}
