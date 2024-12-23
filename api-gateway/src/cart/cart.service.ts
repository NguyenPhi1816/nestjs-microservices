import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { AddToCartRequestDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityRequestDto } from './dto/update-cart-quantity.dto';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

@Injectable()
export class CartService {
  private orderClient: ClientProxy;
  private productClient: ClientProxy;
  private userClient: ClientProxy;
  private promotionClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.orderClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('ORDER_SERVICE_HOST'),
        port: configService.get('ORDER_SERVICE_PORT'),
      },
    });
    this.productClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PRODUCT_SERVICE_HOST'),
        port: configService.get('PRODUCT_SERVICE_PORT'),
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

  async getProductInfor(productVariantId: number) {
    const product = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-product-variant-infor' }, productVariantId)
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

    const discount = await firstValueFrom(
      this.promotionClient
        .send({ cmd: 'get-applied-promotion-by-product-id' }, product.baseProductId)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.message)),
          ),
          map((response) => {
            return response as {
              numberOfPurchases: number;
            };
          }),
        ),
    );

    return {...product, discount};
  }

  async getCartByUserId(userId: number) {
    const carts = await firstValueFrom(
      this.orderClient.send({ cmd: 'get-cart' }, userId).pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    const response = await Promise.all(
      carts.map(async (item) => {
        const productInfor = await this.getProductInfor(item.productVariantId);
        return {
          ...item,
          ...productInfor,
        };
      }),
    );

    return response;
  }

  async addProductToCart(userId: number, addToCartDto: AddToCartRequestDto) {
    const productVariantQuantity = await firstValueFrom(
      this.productClient
        .send(
          { cmd: 'get-product-variant-quantity' },
          addToCartDto.productVariantId,
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

    const carts = await firstValueFrom(
      this.orderClient
        .send(
          { cmd: 'add-to-cart' },
          {
            userId,
            addToCartDto,
            remainingQuantity: productVariantQuantity.quantity,
          },
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

    await Promise.all(
      addToCartDto.categoryIds.map((categoryId) => {
        const req = {
          userId: userId,
          categoryId: categoryId,
          productId: addToCartDto.baseProductId,
          activityType: UserActivity.CART,
        };

        return firstValueFrom(
          this.userClient.send({ cmd: 'save-user-activity' }, req).pipe(
            catchError((error) => {
              return throwError(() => new RpcException(error.response));
            }),
            map(async (response) => {
              return response;
            }),
          ),
        );
      }),
    );

    const response = await Promise.all(
      carts.map(async (item) => {
        const productInfor = await this.getProductInfor(item.productVariantId);
        return {
          ...item,
          ...productInfor,
        };
      }),
    );

    return response;
  }

  async updateCartQuantity(
    userId: number,
    productVariantId: number,
    updateCartQuantityRequestDto: UpdateCartQuantityRequestDto,
  ) {
    const productVariantQuantity = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-product-variant-quantity' }, productVariantId)
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );

    const carts = await firstValueFrom(
      this.orderClient
        .send(
          { cmd: 'update-cart-quantity' },
          {
            userId,
            productVariantId,
            updateCartQuantityRequestDto,
            remainingQuantity: productVariantQuantity.quantity,
          },
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

    const response = await Promise.all(
      carts.map(async (item) => {
        const productInfor = await this.getProductInfor(item.productVariantId);
        return {
          ...item,
          ...productInfor,
        };
      }),
    );

    return response;
  }

  async deleteCart(userId: number, productVariantId: number) {
    const carts = await firstValueFrom(
      this.orderClient
        .send({ cmd: 'delete-cart' }, { userId, productVariantId })
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        ),
    );

    const response = await Promise.all(
      carts.map(async (item) => {
        const productInfor = await this.getProductInfor(item.productVariantId);
        return {
          ...item,
          ...productInfor,
        };
      }),
    );

    return response;
  }
}
