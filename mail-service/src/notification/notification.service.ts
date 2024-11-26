import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateNotification from './dto/create-notification.dto';
import { NotificationType } from 'src/constants/enum/notification-type.enum';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createAndSendNotification(data: CreateNotification) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        message: data.message,
        receiverEmail: data.receiverEmail,
      },
      select: {
        id: true,
        userId: true,
        message: true,
        receiverEmail: true,
        type: true,
        createAt: true,
        isRead: true,
      },
    });

    switch (notification.type) {
      case NotificationType.NEW_ORDER:
        await this.mailService.sendMail(
          notification.receiverEmail,
          'Thông báo đơn hàng mới từ GUDS',
          notification.message,
        );
        break;
      case NotificationType.CANCEL_ORDER:
        await this.mailService.sendMail(
          notification.receiverEmail,
          'Đơn hàng GUDS đã bị hủy',
          notification.message,
        );
        break;
      case NotificationType.SUCCESS_ORDER:
        await this.mailService.sendMail(
          notification.receiverEmail,
          'Đơn hàng GUDS đã được giao hành công',
          notification.message,
        );
        break;
    }

    return { ...data, ...notification };
  }

  async getNotifications(userId: number, page: number = 1) {
    const pageSize = 20;
    const skip = (page - 1) * pageSize;
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createAt: 'desc',
      },
      skip: skip,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        message: true,
        receiverEmail: true,
        type: true,
        createAt: true,
        isRead: true,
      },
    });

    const totalNotifications = await this.prisma.notification.count({
      where: {
        userId: userId,
      },
    });

    const unreadNotis = await this.prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return {
      data: notifications,
      meta: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: totalNotifications,
        unreadNotifications: unreadNotis,
        totalPages: Math.ceil(totalNotifications / pageSize),
      },
    };
  }

  async updateNotificationStatus(userId: number, notiIds: number[]) {
    await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notiIds,
        },
      },
      data: {
        isRead: true,
      },
    });

    const unreadNotis = await this.prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return unreadNotis;
  }
}
