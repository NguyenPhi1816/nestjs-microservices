import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import UserActivityDto from './dto/user-activity.dto';
import UserSearchHistoryDto from './dto/user-search-history.dto';
import GetProductStatisticsDto from './dto/get-product-statistics.dto';
import GetPurchasesStatisticsDto from './dto/get-purchases-statistics.dto';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async saveUserActivity(data: UserActivityDto) {
    await this.prisma.userActivity.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        productId: data.productId,
        activityType: data.activityType,
      },
    });
    return { status: 200, message: 'Lưu thông tin thành công' };
  }

  async getProductStatistics(data: GetProductStatisticsDto) {
    const result: { date: Date; count: number }[] = await this.prisma.$queryRaw`
      SELECT DATE("createdAt") AS date, COUNT(*) AS count
      FROM "UserActivity"
      WHERE "productId" = ${data.productId}
        AND "activityType" = ${data.type}
        AND "createdAt" >= ${new Date(data.fromDate)}
        AND "createdAt" <= ${new Date(data.toDate)}
      GROUP BY DATE("createdAt")
      ORDER BY date;
    `;
    const sanitizedResult = result.map((item) => {
      return {
        date: item.date,
        count: item.count.toString(),
      };
    });
    return sanitizedResult;
  }

  async getPurchasesStatistics(data: GetPurchasesStatisticsDto) {
    const result: { date: Date; count: number }[] = await this.prisma.$queryRaw`
      SELECT DATE("createdAt") AS date, COUNT(*) AS count
      FROM "UserActivity"
      WHERE "activityType" = ${UserActivity.PURCHASE}
        AND "createdAt" >= ${new Date(data.fromDate)}
        AND "createdAt" <= ${new Date(data.toDate)}
      GROUP BY DATE("createdAt")
      ORDER BY date;
    `;
    const sanitizedResult = result.map((item) => {
      return {
        date: item.date,
        count: item.count.toString(),
      };
    });
    return sanitizedResult;
  }

  async getTop10(activityType: string, type: string) {
    switch (type) {
      case 'top10Products':
        const topProducts = await this.prisma.userActivity.groupBy({
          by: ['productId'],
          where: {
            activityType: activityType,
            productId: {
              not: null,
            },
          },
          _count: {
            productId: true,
          },
          orderBy: {
            _count: {
              productId: 'desc',
            },
          },
          take: 10,
        });

        return topProducts.map((item) => ({
          id: item.productId,
          count: item._count.productId,
        }));
      case 'top10Categories':
        const topCategories = await this.prisma.userActivity.groupBy({
          by: ['categoryId'],
          where: {
            activityType: activityType,
          },
          _count: {
            categoryId: true,
          },
          orderBy: {
            _count: {
              categoryId: 'desc',
            },
          },
          take: 10,
        });

        return topCategories.map((item) => ({
          id: item.categoryId,
          count: item._count.categoryId,
        }));
    }
  }

  async saveUserSearchHistory(data: UserSearchHistoryDto) {
    if (data.searchQuery !== '_') {
      await this.prisma.userSearchHistory.create({
        data: {
          userId: data.userId,
          searchQuery: data.searchQuery,
        },
      });
      return { status: 200, message: 'Lưu thông tin thành công' };
    } else {
      return { status: 200, message: 'Từ khóa không hợp lệ' };
    }
  }
}
