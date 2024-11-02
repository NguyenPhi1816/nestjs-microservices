import { Controller } from '@nestjs/common';
import { ReviewService } from './review.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateReviewRequestDto } from './dto/create-review.dto';
import { EditReviewRequestDto } from './dto/update-review.dto';
import { DeteleReviewParams } from './dto/delete-review.dto';
import { GetReviewsByBPSlugRequest } from './dto/get-review-by-bp-slug.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @MessagePattern({ cmd: 'create-review' })
  createReview(createReviewRequestDto: CreateReviewRequestDto) {
    return this.reviewService.createReview(createReviewRequestDto);
  }

  @MessagePattern({ cmd: 'update-review' })
  updateReview(editReviewRequestDto: EditReviewRequestDto) {
    return this.reviewService.editReview(editReviewRequestDto);
  }

  @MessagePattern({ cmd: 'delete-review' })
  deleteReview(deleteReviewParams: DeteleReviewParams) {
    return this.reviewService.deleteReview(deleteReviewParams);
  }

  @MessagePattern({ cmd: 'get-review-by-base-product-slug' })
  getReviewsByProductSlug(data: any) {
    return this.reviewService.getReviewsByProductSlug(data);
  }

  @MessagePattern({ cmd: 'get-review-summary' })
  async getReviewSummary(productVariantIds: number[]) {
    return this.reviewService.getReviewSummary(productVariantIds);
  }
}
