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
import { UserActivity } from 'src/constrants/enum/user-activity.enum';
import { GetProductVariantResult } from 'src/review/dto/get-product-variant-result.dto';
import { NotificationService } from 'src/notification/notification.service';
import CreateNotificationDto from 'src/notification/dto/create-notification.dto';
import { NotificationType } from 'src/constrants/enum/notification-type.enum';

@Injectable()
export class OrderService {
  private productClient: ClientProxy;
  private orderClient: ClientProxy;
  private userClient: ClientProxy;
  private promotionClient: ClientProxy;

  constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
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
    this.promotionClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PROMOTION_SERVICE_HOST'),
        port: configService.get('PROMOTION_SERVICE_PORT'),
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

      const discountPromises = order.orderDetails.map(
        async (item) =>
          item.discountId &&
          firstValueFrom(
            this.promotionClient
              .send({ cmd: 'get-discount-by-id' }, item.discountId)
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
      const discounts: any[] = await Promise.all(discountPromises);

      const orderDetailResponse: OrderDetailResponse[] = order.orderDetails.map(
        (item, index) => ({
          id: item.id,
          optionValue: productVariant[index].optionValue,
          price: item.price,
          productImage: productVariant[index].productImage,
          productName: productVariant[index].productName,
          quantity: item.quantity,
          review: null,
          discount: item.discountId
            ? discounts.find((discount) => discount.id == item.discountId)
            : {},
        }),
      );

      let voucher = {};
      if (order.voucherId) {
        voucher = await firstValueFrom(
          this.promotionClient
            .send({ cmd: 'get-voucher-by-id' }, order.voucherId)
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
      }

      if (userProfile) {
        return {
          ...order,
          userName: userProfile.firstName + ' ' + userProfile.lastName,
          orderDetails: orderDetailResponse,
          voucher,
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

        await Promise.all(
          data.orderDetails.flatMap((orderDetail) =>
            orderDetail.categoryIds.map((categoryId) => {
              const req = {
                userId,
                categoryId,
                productId: orderDetail.baseProductId,
                activityType: UserActivity.PURCHASE,
              };

              return firstValueFrom(
                this.userClient
                  .send({ cmd: 'save-user-activity' }, req)
                  .pipe(
                    catchError((error) =>
                      throwError(() => new RpcException(error.response)),
                    ),
                  ),
              );
            }),
          ),
        );

        if (updateResult) {
          const createNotiReq: CreateNotificationDto = {
            userId: Number.parseInt(this.configService.get('ADMIN_ID')),
            receiverEmail: this.configService.get('ADMIN_EMAIL'),
            type: NotificationType.NEW_ORDER,
            message: `Bạn nhận được đơn hàng mới. Mã đơn hàng là #${createOrderResult.order.id}. Vui lòng kiểm tra đơn hàng.`,
          };

          this.notificationService.createNotification(createNotiReq);

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
        const notiReq: CreateNotificationDto = {
          userId: Number.parseInt(this.configService.get('ADMIN_ID')),
          receiverEmail: this.configService.get('ADMIN_EMAIL'),
          type: NotificationType.CANCEL_ORDER,
          message: `Đơn hàng #${result.id} đã bị hủy. Vui lòng kiểm tra đơn hàng.`,
        };

        this.notificationService.createNotification(notiReq);
        return result;
      }
    } else if (result.status === OrderStatus.SUCCESS) {
      const notiReq: CreateNotificationDto = {
        userId: Number.parseInt(this.configService.get('ADMIN_ID')),
        receiverEmail: this.configService.get('ADMIN_EMAIL'),
        type: NotificationType.SUCCESS_ORDER,
        message: `Đơn hàng #${result.id} đã được giao thành công.`,
      };

      this.notificationService.createNotification(notiReq);
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
          const discountPromises = order.orderDetails.map(
            async (item) =>
              item.discountId &&
              firstValueFrom(
                this.promotionClient
                  .send({ cmd: 'get-discount-by-id' }, item.discountId)
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
          const discounts: any[] = await Promise.all(discountPromises);

          const orderDetailResponse: OrderDetailResponse[] =
            order.orderDetails.map((item, index) => ({
              id: item.id,
              optionValue: productVariant[index].optionValue,
              price: item.price,
              productImage: productVariant[index].productImage,
              productName: productVariant[index].productName,
              quantity: item.quantity,
              review: null,
              discount: item.discountId
                ? discounts.find((discount) => discount.id == item.discountId)
                : {},
            }));

          let voucher = {};
          if (order.voucherId) {
            voucher = await firstValueFrom(
              this.promotionClient
                .send({ cmd: 'get-voucher-by-id' }, order.voucherId)
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
          }

          if (userProfile) {
            return {
              ...order,
              userName: userProfile.firstName + ' ' + userProfile.lastName,
              orderDetails: orderDetailResponse,
              voucher,
            };
          }
        }),
      );
    }
  }

  async getOrderStatistic() {
    return this.orderClient.send({ cmd: 'get-order-statistic' }, {});
  }

  async getRevenueByProductVariantIds(slug: string) {
    const productVariant: GetProductVariantResult[] = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-product-variant-by-base-product-slug' }, slug)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => response as GetProductVariantResult[]),
        ),
    );

    return this.orderClient.send(
      { cmd: 'get-revenue-by-product-variant-ids' },
      productVariant.map((item) => item.id),
    );
  }
}
