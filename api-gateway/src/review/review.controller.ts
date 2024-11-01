import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewService } from './review.service';
import { EditReviewRequestDto } from './dto/edit-review.dto';
import { DeteleReviewParams } from './dto/delete-review.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  createReview(
    @GetUser('id') userId: number,
    @Body() createReviewRequestDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(userId, createReviewRequestDto);
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  editFeedback(@Body() editReviewRequestDto: EditReviewRequestDto) {
    return this.reviewService.editReview(editReviewRequestDto);
  }

  @Delete('/:reviewId')
  @UseGuards(AccessTokenGuard)
  deleteFeedback(@Param() deleteReviewParams: DeteleReviewParams) {
    return this.reviewService.deleteReview(deleteReviewParams);
  }

  @Get('/:slug')
  getReviewByBaseProductSlug(
    @Param() params: { slug: string },
    @Query('rating') rating?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return this.reviewService.getReviewByBPSlug(
      params.slug,
      rating,
      page,
      limit,
    );
  }
}
