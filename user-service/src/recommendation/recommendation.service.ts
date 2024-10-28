import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async seedData() {
    const activities: Prisma.UserActivityCreateManyInput[] = [];
    const activityTypes = ['view', 'cart', 'purchase', 'favorite'];
    const numUsers = 3;
    const numCategories = 10;

    for (let i = 0; i < 200; i++) {
      const userId = 1;
      const categoryId = Math.floor(Math.random() * numCategories) + 1; // Ngẫu nhiên giữa categoryId 1 đến 10
      const activityType =
        activityTypes[Math.floor(Math.random() * activityTypes.length)]; // Ngẫu nhiên loại hoạt động

      activities.push({
        userId,
        categoryId,
        activityType,
        createdAt: new Date(),
      });
    }

    // Lưu toàn bộ dữ liệu vào database
    await this.prisma.userActivity.createMany({
      data: activities,
    });

    return 'Seed data created successfully with randomness';
  }

  async getTopCategories(userId: number) {
    const topCategories = await this.prisma.userActivity.groupBy({
      by: ['categoryId'],
      where: {
        userId: userId,
      },
      _count: {
        categoryId: true,
      },
      orderBy: {
        _count: {
          categoryId: 'desc',
        },
      },
      take: 3,
    });
    return topCategories;
  }
}
