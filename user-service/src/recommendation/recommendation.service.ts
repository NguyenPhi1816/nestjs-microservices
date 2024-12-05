import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import UserActivityDto from './dto/user-activity.dto';
import UserSearchHistoryDto from './dto/user-search-history.dto';
import GetProductStatisticsDto from './dto/get-product-statistics.dto';
import GetPurchasesStatisticsDto from './dto/get-purchases-statistics.dto';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';
import { normalizeName } from 'src/utils/normalize-name.util';
import { getRecommendationProducts } from './recommendationHandling';

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
          searchQueryNormalize: normalizeName(data.searchQuery),
        },
      });
      return { status: 200, message: 'Lưu thông tin thành công' };
    } else {
      return { status: 200, message: 'Từ khóa không hợp lệ' };
    }
  }

  // START OF RECOMMENDATION
  async getActivitiesGroupedByUser() {
    // Lấy tất cả các UserActivity
    const activities = await this.prisma.userActivity.findMany({
      select: {
        userId: true,
        productId: true,
        activityType: true,
        createdAt: true,
      },
    });

    return activities.reduce((acc, item) => {
      const { userId, productId, activityType, createdAt } = item;

      const existUser = acc.find((i) => i.userId === item.userId);
      if (!existUser) {
        acc.push({
          userId,
          activities: [{ productId, activityType, createdAt }],
        });

        return acc;
      }

      existUser.activities.push({ productId, activityType, createdAt });
      return acc;
    }, []);
  }

  async recommendProducts(
    userId: number,
    baseProductIds: number[],
    limit: number = 10,
  ) {
    // Lấy lịch sử hoạt động của người dùng
    const activities = await this.getActivitiesGroupedByUser();

    const _recommendProducts = getRecommendationProducts(
      userId,
      baseProductIds,
      activities,
      limit,
    );

    return _recommendProducts;
  }
  // END OF RECOMMENDATION

  // START OF SEARCH RECOMMENDATION
  async getUserSearchRecommend(userId?: number) {
    let history = [];

    if (userId) {
      history = await this.prisma.userSearchHistory.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          searchQuery: true,
        },
      });

      history = Array.from(
        new Set(history.map((item) => item.searchQuery)),
      ).slice(0, 5);
    }

    const popularKeywords = await this.prisma.userSearchHistory.groupBy({
      by: ['searchQuery'],
      _count: {
        searchQuery: true,
      },
      orderBy: {
        _count: {
          searchQuery: 'desc',
        },
      },
      take: 5,
    });

    const response = {
      history: history,
      popularKeywords: popularKeywords.map((item) => item.searchQuery),
    };

    return response;
  }

  async findRelatedKeywords(userInput: string = ''): Promise<string[]> {
    const query = normalizeName(userInput);

    const keywords = await this.prisma.userSearchHistory.findMany({
      where: {
        searchQueryNormalize: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        searchQuery: true,
      },
    });

    // Loại bỏ trùng lặp và giới hạn số lượng từ khóa
    const uniqueKeywords = Array.from(
      new Set(keywords.map((item) => item.searchQuery)),
    ).slice(0, 10);

    return uniqueKeywords;
  }
  // END OF SEARCH RECOMMENDATION
}
