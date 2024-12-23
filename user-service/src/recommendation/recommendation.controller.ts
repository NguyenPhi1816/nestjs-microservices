import { Controller } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { MessagePattern } from '@nestjs/microservices';
import UserActivityDto from './dto/user-activity.dto';
import UserSearchHistoryDto from './dto/user-search-history.dto';
import GetProductStatisticsDto from './dto/get-product-statistics.dto';
import GetPurchasesStatisticsDto from './dto/get-purchases-statistics.dto';
import getTop10Dto from './dto/get-top-10.dto';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @MessagePattern({ cmd: 'save-user-activity' })
  saveUserActivity(data: UserActivityDto) {
    return this.recommendationService.saveUserActivity(data);
  }

  @MessagePattern({ cmd: 'get-product-statistics' })
  getProductViewsCount(data: GetProductStatisticsDto) {
    return this.recommendationService.getProductStatistics(data);
  }

  @MessagePattern({ cmd: 'get-purchases-statistics' })
  getPurchasesViewsCount(data: GetPurchasesStatisticsDto) {
    return this.recommendationService.getPurchasesStatistics(data);
  }

  @MessagePattern({ cmd: 'get-top-10' })
  getTop10(data: getTop10Dto) {
    return this.recommendationService.getTop10(data.activityType, data.type);
  }

  @MessagePattern({ cmd: 'save-user-search-history' })
  saveUserSearchHistory(data: UserSearchHistoryDto) {
    return this.recommendationService.saveUserSearchHistory(data);
  }

  @MessagePattern({ cmd: 'calc-recommendation-data' })
  calcRecommendationData(baseProductIds: number[]) {
    return this.recommendationService.calcRecommendationData(baseProductIds);
  }

  @MessagePattern({ cmd: 'get-matrix-data' })
  getMatrixData() {
    return this.recommendationService.getMatrixData();
  }

  @MessagePattern({ cmd: 'recommend-products' })
  recommendProducts(data: { userId: number; limit?: number }) {
    return this.recommendationService.recommendProducts(
      data.userId,
      data.limit,
    );
  }

  @MessagePattern({ cmd: 'get-user-search-recommend' })
  getUserSearchRecommend(data: { userId?: number }) {
    return this.recommendationService.getUserSearchRecommend(data.userId);
  }

  @MessagePattern({ cmd: 'get-related-keywords' })
  getRelatedKeywords(query: string = '') {
    return this.recommendationService.findRelatedKeywords(query);
  }
}
