import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreatePromotionDto from './dto/create-promotion.dto';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

@Injectable()
export class PromotionService {
  private promotionClient: ClientProxy;
  private productClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.promotionClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PROMOTION_SERVICE_HOST'),
        port: configService.get('PROMOTION_SERVICE_PORT'),
      },
    });
    this.productClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PRODUCT_SERVICE_HOST'),
        port: configService.get('PRODUCT_SERVICE_PORT'),
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
    const promotion = await firstValueFrom(
      this.promotionClient
        .send({ cmd: 'get-promotion-by-id' }, { promotionId: id })
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );
    promotion.discounts = await Promise.all(
      promotion.discounts.map(async (discount) => {
        const appliedProducts = await firstValueFrom(
          this.productClient
            .send(
              { cmd: 'get-base-product-by-ids' },
              discount.appliedBaseProductIds,
            )
            .pipe(
              catchError((error) => {
                return throwError(() => new RpcException(error.response));
              }),
              map(async (response) => {
                return response;
              }),
            ),
        );
        delete discount.appliedBaseProductIds;
        const result = { ...discount, appliedProducts };
        return result;
      }),
    );
    return promotion;
  }
}
