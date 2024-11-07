import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewRequestDto } from './dto/create-review.dto';
import { EditReviewRequestDto } from './dto/update-review.dto';
import { DeteleReviewParams } from './dto/delete-review.dto';
import { RpcException } from '@nestjs/microservices';
import { GetReviewsByBPSlugRequest } from './dto/get-review-by-bp-slug.dto';
import { ReviewDto } from './dto/review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(createReviewRequestDto: CreateReviewRequestDto) {
    try {
      const existReview = await this.prisma.review.findUnique({
        where: {
          orderDetailId: createReviewRequestDto.orderDetailId,
        },
      });

      if (existReview != null) {
        throw new RpcException(
          new BadRequestException('Feedback already exists.'),
        );
      }

      return this.prisma.review.create({
        data: {
          rating: createReviewRequestDto.rating,
          comment: createReviewRequestDto.comment,
          createdAt: new Date(),
          orderDetailId: createReviewRequestDto.orderDetailId,
          productVariantId: createReviewRequestDto.productVariantId,
          userId: createReviewRequestDto.userId,
          updateAt: null,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async editReview(editReviewRequestDto: EditReviewRequestDto) {
    try {
      const review = await this.prisma.review.update({
        where: { id: editReviewRequestDto.reviewId },
        data: {
          comment: editReviewRequestDto.comment,
          rating: editReviewRequestDto.rating,
          updateAt: new Date(),
        },
      });
      return review;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(deleteReviewParams: DeteleReviewParams) {
    try {
      const response = await this.prisma.review.delete({
        where: { id: deleteReviewParams.reviewId },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getReviewsByProductSlug(
    data: GetReviewsByBPSlugRequest,
  ): Promise<ReviewResponseDto> {
    const productVariantIds = data.products.map((item) => item.id);

    const reviews = await this.prisma.review.findMany({
      where: {
        productVariantId: {
          in: productVariantIds,
        },
        ...(data.rating !== undefined && { rating: data.rating }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        comment: true,
        createdAt: true,
        userId: true,
        rating: true,
        updateAt: true,
        productVariantId: true,
      },
      skip: (data.page - 1) * Number.parseInt(data.limit),
      take: Number.parseInt(data.limit),
    });

    const myReviews: ReviewDto[] = reviews.map((item) => {
      const product = data.products.find(
        (product) => product.id === item.productVariantId,
      );

      return {
        id: item.id,
        comment: item.comment,
        createdAt: item.createdAt.toString(),
        userId: item.userId,
        rating: item.rating,
        updateAt: item.updateAt ? item.updateAt.toString() : '',
        variant: product.variant,
      };
    });

    const response: ReviewResponseDto = {
      numberOfReviews: myReviews.length,
      reviews: myReviews,
    };

    return response;
  }

  async getReviewSummary(productVariantIds: number[]) {
    const whereClause = {
      productVariantId: {
        in: productVariantIds,
      },
    };

    const numberOfReviewsQuery = this.prisma.review.count({
      where: whereClause,
    });

    const averageRatingQuery = this.prisma.review.aggregate({
      where: whereClause,
      _avg: {
        rating: true,
      },
    });

    const [numberOfReviews, averageRatingResult] = await Promise.all([
      numberOfReviewsQuery,
      averageRatingQuery,
    ]);

    return {
      numberOfReviews,
      averageRating: averageRatingResult._avg.rating ?? 0,
    };
  }
}
