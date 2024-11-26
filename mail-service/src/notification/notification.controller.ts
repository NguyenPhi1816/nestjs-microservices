import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MessagePattern } from '@nestjs/microservices';
import CreateNotification from './dto/create-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({ cmd: 'create-notification' })
  createNotification(data: CreateNotification) {
    return this.notificationService.createAndSendNotification(data);
  }

  @MessagePattern({ cmd: 'get-notifications' })
  get20LastestNoti(data: { userId: number; page: number }) {
    return this.notificationService.getNotifications(data.userId, data.page);
  }

  @MessagePattern({ cmd: 'update-notification-status' })
  updateNotificationStatus(data: { userId: number; notiIds: number[] }) {
    return this.notificationService.updateNotificationStatus(
      data.userId,
      data.notiIds,
    );
  }
}
