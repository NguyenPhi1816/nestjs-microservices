import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getNotification(
    @GetUser('id') userId: number,
    @Query('page', ParseIntPipe) page: number = 1,
  ) {
    return this.notificationService.getNotifications(userId, page);
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  updateNotificationStatus(
    @GetUser('id') userId: number,
    @Body() data: { notiIds: number[] },
  ) {
    console.log(data);
    return this.notificationService.updateNotificationStatus(
      userId,
      data.notiIds,
    );
  }
}
