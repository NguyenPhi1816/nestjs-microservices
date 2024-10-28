import { Controller } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @MessagePattern({ cmd: 'seed-data' })
  seedData() {
    return this.recommendationService.seedData();
  }

  @MessagePattern({ cmd: 'get-top-categories' })
  getTopCategories(userId: number) {
    return this.recommendationService.getTopCategories(userId);
  }
}
