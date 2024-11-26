import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

@Module({
  controllers: [OrderController],
  providers: [OrderService, NotificationGateway, NotificationService],
})
export class OrderModule {}
