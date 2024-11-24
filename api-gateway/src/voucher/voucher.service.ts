import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreateVoucherDto from './dto/create-voucher.dto';
import { catchError, map, throwError } from 'rxjs';

@Injectable()
export class VoucherService {
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

  async createVoucher(data: CreateVoucherDto) {
    return this.promotionClient.send({ cmd: 'create-voucher' }, data).pipe(
      catchError((error) => {
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async deleteVoucher(voucherId: number) {
    return this.promotionClient.send({ cmd: 'delete-voucher' }, voucherId).pipe(
      catchError((error) => {
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async updateVoucherStatus(voucherId: number, status: string) {
    return this.promotionClient
      .send({ cmd: 'update-voucher-status' }, { voucherId, status })
      .pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      );
  }

  async getAvailableVouchers() {
    return this.promotionClient
      .send({ cmd: 'get-available-vouchers' }, {})
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
