import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { CreateBrandDto } from './dto/create-brand.dto';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  map,
  throwError,
} from 'rxjs';
import { CreateBrandRequestDto } from './dto/create-brand-request.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { UpdateBrandRequestDto } from './dto/update-brand-request.dto';
import UploadResponse from './dto/upload-response.dto';

@Injectable()
export class BrandService {
  private productClient: ClientProxy;
  private mediaClient: ClientProxy;
  private reviewClient: ClientProxy;
  private orderClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.productClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('PRODUCT_SERVICE_HOST'),
        port: configService.get('PRODUCT_SERVICE_PORT'),
      },
    });
    this.mediaClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('MEDIA_SERVICE_HOST'),
        port: configService.get('MEDIA_SERVICE_PORT'),
      },
    });

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
  }

  async getAllBrands() {
    return this.productClient.send({ cmd: 'get-all-brands' }, {});
  }

  async createBrand(data: CreateBrandDto) {
    const fileBuffers = [data.image.buffer];
    const uploadRes: UploadResponse[] = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response as UploadResponse[];
        }),
      ),
    );

    if (uploadRes.length > 0) {
      const request: CreateBrandRequestDto = {
        name: data.name,
        image: uploadRes[0].path,
        imageId: uploadRes[0].id,
      };
      return this.productClient.send({ cmd: 'create-brand' }, request).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      );
    }
  }

  async updateBrand(data: UpdateBrandDto) {
    if (!!data.newImage) {
      // remove exist image from cloudinary
      if (data.existImageId) {
        await firstValueFrom(
          this.mediaClient
            .send({ cmd: 'delete-image' }, data.existImageId)
            .pipe(
              defaultIfEmpty(null), // Trả về null nếu không có phần tử nào
            ),
        );
      }

      const fileBuffers = [data.newImage.buffer];
      const uploadRes: UploadResponse[] = await firstValueFrom(
        this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => {
            return response as UploadResponse[];
          }),
        ),
      );
      if (uploadRes.length > 0) {
        data.existImage = uploadRes[0].path;
        data.existImageId = uploadRes[0].id;
      }
    }

    const request: UpdateBrandRequestDto = {
      id: Number.parseInt(data.id),
      name: data.name,
      image: data.existImage,
      imageId: data.existImageId,
    };
    return this.productClient.send({ cmd: 'update-brand' }, request).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getBrandProducts(slug: string) {
    return this.productClient.send({ cmd: 'get-brand-products' }, slug);
  }

  async getBrandBySlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ) {
    const brand = await firstValueFrom(
      this.productClient
        .send(
          { cmd: 'get-brand-by-slug' },
          { slug, fromPrice, toPrice, sortBy, page, limit },
        )
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => {
            return response;
          }),
        ),
    );

    await Promise.all(
      brand.products.map(async (product) => {
        const reviewSummary = await firstValueFrom(
          this.reviewClient
            .send({ cmd: 'get-review-summary' }, product.productVariantIds)
            .pipe(
              catchError((error) =>
                throwError(() => new RpcException(error.message)),
              ),
              map((response) => {
                return response as {
                  numberOfReviews: number;
                  averageRating: number;
                };
              }),
            ),
        );

        const orderSummary = await firstValueFrom(
          this.orderClient
            .send({ cmd: 'get-order-summary' }, product.productVariantIds)
            .pipe(
              catchError((error) =>
                throwError(() => new RpcException(error.message)),
              ),
              map((response) => {
                return response as {
                  numberOfPurchases: number;
                };
              }),
            ),
        );

        product.averageRating = reviewSummary.averageRating;
        product.numberOfReviews = reviewSummary.numberOfReviews;
        product.numberOfPurchases = orderSummary.numberOfPurchases;
      }),
    );

    return brand;
  }
}
