import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreateDiscountDto from './dto/create-discount.dto';
import { catchError, map, throwError } from 'rxjs';
import ApplyDiscountDto from './dto/apply-discount.dto';

@Injectable()
export class DiscountService {
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

  async createDiscount(data: CreateDiscountDto) {
    return this.promotionClient.send({ cmd: 'create-discount' }, data).pipe(
      catchError((error) => {
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async applyDiscountToProducts(data: ApplyDiscountDto) {
    return this.promotionClient
      .send({ cmd: 'apply-discount-to-products' }, data)
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
