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
import { OrderResult } from './dto/order-result.dto';
import { OrderResponse } from './dto/order-response.dto';
import ProfileResult from './dto/profile-result.dto';
import Get_PV_Infor_Result from './dto/get-pv-infor-result.dto';
import { OrderDetailResponse } from './dto/order-detail-response.dto';
import { OrderStatus } from 'src/constrants/enum/order-status.enum';

@Injectable()
export class OrderService {
  private productClient: ClientProxy;
  private orderClient: ClientProxy;
  private userClient: ClientProxy;

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
    this.userClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('USER_SERVICE_HOST'),
        port: configService.get('USER_SERVICE_PORT'),
      },
    });
  }

  async getAllOrders() {
    return this.orderClient.send({ cmd: 'get-all-orders' }, {});
  }

  async getOrderDetailById(orderId: number): Promise<OrderResponse> {
    const order: OrderResult = await firstValueFrom(
      this.orderClient.send({ cmd: 'get-order-detail-by-id' }, orderId).pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    if (order) {
      const userProfile: ProfileResult = await firstValueFrom(
        this.userClient.send({ cmd: 'get-profile' }, order.userId).pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
      );

      const productVariantPromises = order.orderDetails.map(async (item) =>
        firstValueFrom(
          this.productClient
            .send({ cmd: 'get-product-variant-infor' }, item.productVariantId)
            .pipe(
              catchError((error) => {
                console.log(error);
                return throwError(() => new RpcException(error.response));
              }),
              map(async (response) => {
                return response;
              }),
            ),
        ),
      );
      const productVariant: Get_PV_Infor_Result[] = await Promise.all(
        productVariantPromises,
      );

      const orderDetailResponse: OrderDetailResponse[] = order.orderDetails.map(
        (item, index) => ({
          id: item.id,
          optionValue: productVariant[index].optionValue,
          price: item.price,
          productImage: productVariant[index].productImage,
          productName: productVariant[index].productName,
          quantity: item.quantity,
          review: null,
        }),
      );

      if (userProfile) {
        return {
          ...order,
          userName: userProfile.firstName + ' ' + userProfile.lastName,
          orderDetails: orderDetailResponse,
        };
      }
    }
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

  async updateOrder(orderId: number, status: string) {
    const result: OrderResult = await firstValueFrom(
      this.orderClient.send({ cmd: 'update-order' }, { orderId, status }).pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    if (result.status === OrderStatus.CANCEL) {
      const updateRequest: Update_PV_Quan_Req[] = result.orderDetails.map(
        (item) => {
          return {
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            type: 'increment',
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
        return result;
      }
    }
  }

  async getOrdersByUserId(userId: number) {
    const orders: OrderResult[] = await firstValueFrom(
      this.orderClient.send({ cmd: 'get-order-by-user-id' }, userId).pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    if (orders) {
      return await Promise.all(
        orders.map(async (order) => {
          const userProfile: ProfileResult = await firstValueFrom(
            this.userClient.send({ cmd: 'get-profile' }, order.userId).pipe(
              catchError((error) => {
                console.log(error);
                return throwError(() => new RpcException(error.response));
              }),
              map(async (response) => {
                return response;
              }),
            ),
          );

          const productVariantPromises = order.orderDetails.map(async (item) =>
            firstValueFrom(
              this.productClient
                .send(
                  { cmd: 'get-product-variant-infor' },
                  item.productVariantId,
                )
                .pipe(
                  catchError((error) => {
                    console.log(error);
                    return throwError(() => new RpcException(error.response));
                  }),
                  map(async (response) => {
                    return response;
                  }),
                ),
            ),
          );
          const productVariant: Get_PV_Infor_Result[] = await Promise.all(
            productVariantPromises,
          );

          const orderDetailResponse: OrderDetailResponse[] =
            order.orderDetails.map((item, index) => ({
              id: item.id,
              optionValue: productVariant[index].optionValue,
              price: item.price,
              productImage: productVariant[index].productImage,
              productName: productVariant[index].productName,
              quantity: item.quantity,
              review: null,
            }));

          if (userProfile) {
            return {
              ...order,
              userName: userProfile.firstName + ' ' + userProfile.lastName,
              orderDetails: orderDetailResponse,
            };
          }
        }),
      );
    }
  }
}
