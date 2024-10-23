import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import Update_PV_Quan_Req from './dto/update-pv-quan.dto';

@Injectable()
export class OrderService {
  private productClient: ClientProxy;
  private orderClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.productClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PRODUCT_SERVICE_HOST'),
        port: configService.get('PRODUCT_SERVICE_PORT'),
      },
    });
    this.orderClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('ORDER_SERVICE_HOST'),
        port: configService.get('ORDER_SERVICE_PORT'),
      },
    });
  }

  async getAllOrders() {
    return this.orderClient.send({ cmd: 'get-all-orders' }, {});
  }

  async getOrderDetailById(orderId: number) {
    return this.orderClient.send({ cmd: 'get-order-detail-by-id' }, orderId);
  }

  async createOrder(userId: number, data: CreateOrderDto) {
    const isProductAvailable = await firstValueFrom(
      this.productClient
        .send({ cmd: 'check-product-available' }, data.orderDetails)
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );

    if (isProductAvailable) {
      const request = {
        userId: userId,
        dto: data,
      };
      const createOrderResult = await firstValueFrom(
        this.orderClient.send({ cmd: 'create-order' }, request).pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
      );

      if (createOrderResult) {
        const updateRequest: Update_PV_Quan_Req[] = data.orderDetails.map(
          (item) => {
            return {
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              type: 'decrement',
            };
          },
        );
        const updateResult = await firstValueFrom(
          this.productClient
            .send({ cmd: 'update-product-variant-quantity' }, updateRequest)
            .pipe(
              catchError((error) => {
                console.log(error);
                return throwError(() => new RpcException(error.response));
              }),
              map(async (response) => {
                return response;
              }),
            ),
        );

        if (updateResult) {
          return createOrderResult;
        }
      }
    }
  }
}
