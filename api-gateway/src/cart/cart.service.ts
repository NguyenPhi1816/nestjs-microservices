import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

@Injectable()
export class CartService {
  private orderClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.orderClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('ORDER_SERVICE_HOST'),
        port: configService.get('ORDER_SERVICE_PORT'),
      },
    });
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

    return carts;
  }
}
