import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreateDiscountDto from './dto/create-discount.dto';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import ApplyDiscountDto from './dto/apply-discount.dto';

@Injectable()
export class DiscountService {
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

  async createDiscount(data: CreateDiscountDto) {
    const result = await firstValueFrom(
      this.promotionClient.send({ cmd: 'create-discount' }, data).pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    const appliedProducts = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-base-product-by-ids' }, result.appliedBaseProductIds)
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );
    delete result.appliedBaseProductIds;
    return { ...result, appliedProducts };
  }

  async deleteDiscount(discountId: number) {
    return this.promotionClient
      .send({ cmd: 'delete-discount' }, discountId)
      .pipe(
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

  async updateDiscountStatus(discountId: number, status: string) {
    return this.promotionClient
      .send({ cmd: 'update-discount-status' }, { discountId, status })
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
