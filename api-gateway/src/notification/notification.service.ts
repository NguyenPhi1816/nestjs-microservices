import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import NewNotification from './dto/new-message.dto';
import CreateNotificationDto from './dto/create-notification.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

@Injectable()
export class NotificationService {
  private mailClient: ClientProxy;

  constructor(
    private notificationGateway: NotificationGateway,
    private configService: ConfigService,
  ) {
    this.mailClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('MAIL_SERVICE_HOST'),
        port: configService.get('MAIL_SERVICE_PORT'),
      },
    });
  }

  async createNotification(data: CreateNotificationDto) {
    const notification: NewNotification = await firstValueFrom(
      this.mailClient.send({ cmd: 'create-notification' }, data).pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      ),
    );

    this.notificationGateway.sendNotificationToUser(notification);
  }

  async getNotifications(userId: number, page: number = 1) {
    return this.mailClient
      .send({ cmd: 'get-notifications' }, { userId, page })
      .pipe(
        catchError((error) => {
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      );
  }

  async updateNotificationStatus(userId: number, notiIds: number[]) {
    return this.mailClient
      .send({ cmd: 'update-notification-status' }, { userId, notiIds })
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
