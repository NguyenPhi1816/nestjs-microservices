import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { CreateReviewDto } from './dto/create-review.dto';
import { catchError, firstValueFrom, map, tap, throwError } from 'rxjs';
import { CreateReviewRequestDto } from './dto/create-review-request.dto';
import { EditReviewRequestDto } from './dto/edit-review.dto';
import { DeteleReviewParams } from './dto/delete-review.dto';
import { CheckOrderReadyResult } from './dto/check-ready-result.dto';
import { GetProductVariantResult } from './dto/get-product-variant-result.dto';

@Injectable()
export class ReviewService {
  private reviewClient: ClientProxy;
  private orderClient: ClientProxy;
  private productClient: ClientProxy;
  private userClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.reviewClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('REVIEW_SERVICE_HOST'),
        port: configService.get('REVIEW_SERVICE_PORT'),
      },
    });
    this.orderClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('ORDER_SERVICE_HOST'),
        port: configService.get('ORDER_SERVICE_PORT'),
      },
    });
    this.productClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PRODUCT_SERVICE_HOST'),
        port: configService.get('PRODUCT_SERVICE_PORT'),
      },
    });
    this.userClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('USER_SERVICE_HOST'),
        port: configService.get('USER_SERVICE_PORT'),
      },
    });
  }

  async createReview(userId: number, createReviewRequestDto: CreateReviewDto) {
    const orderDetailIds: CheckOrderReadyResult[] = await firstValueFrom(
      this.orderClient
        .send(
          { cmd: 'is-order-ready-for-review' },
          createReviewRequestDto.orderId,
        )
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => response as CheckOrderReadyResult[]),
        ),
    );

    const createReviewPromises = orderDetailIds.map((item) => {
      const request: CreateReviewRequestDto = {
        orderDetailId: item.id,
        productVariantId: item.productVariantId,
        userId: userId,
        comment: createReviewRequestDto.comment,
        rating: createReviewRequestDto.rating,
      };

      return firstValueFrom(
        this.reviewClient.send({ cmd: 'create-review' }, request).pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => response),
        ),
      );
    });
    return await Promise.all(createReviewPromises);
  }

  async editReview(editReviewRequestDto: EditReviewRequestDto) {
    return this.reviewClient
      .send({ cmd: 'update-review' }, editReviewRequestDto)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => response),
      );
  }

  async deleteReview(deleteReviewParams: DeteleReviewParams) {
    return this.reviewClient
      .send({ cmd: 'delete-review' }, deleteReviewParams)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => response),
      );
  }

  async getReviewByBPSlug(
    slug: string,
    rating?: number,
    page: number = 1,
    limit: number = 5,
  ) {
    const productVariant: GetProductVariantResult[] = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-product-variant-by-base-product-slug' }, slug)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => response as GetProductVariantResult[]),
        ),
    );

    const request = {
      products: productVariant,
      rating: rating,
      page: page,
      limit: limit,
    };

    const result = await firstValueFrom(
      this.reviewClient
        .send({ cmd: 'get-review-by-base-product-slug' }, request)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => response),
        ),
    );

    const _reviews = await Promise.all(
      result.reviews.map(async (item) => {
        const user = await firstValueFrom(
          this.userClient.send({ cmd: 'get-profile' }, item.userId).pipe(
            catchError((error) =>
              throwError(() => new RpcException(error.response)),
            ),
            map((response) => response),
          ),
        );

        const customer = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
        };

        return {
          ...item,
          customer,
        };
      }),
    );

    return {
      numberOfReviews: result.numberOfReviews,
      reviews: _reviews,
    };
  }
}
