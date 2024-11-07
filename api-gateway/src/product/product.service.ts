import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { CreateBaseProductDto } from './dto/create-product.dto';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  map,
  throwError,
} from 'rxjs';
import {
  CreateBaseProductRequestDto,
  createBPImage,
} from './dto/create-base-product-request.dto';
import { CreateOptionValuesDto } from './dto/create-option-values.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductVariantRequestDto } from './dto/create-product-variant-request.dto';
import UploadResponse from './dto/upload-response.dto';
import AddBPImage from './dto/add-bp-image.dto';
import Add_BP_Image_Req from './dto/add-bp-image-request.dto';
import UpdateProductVariantDto from './dto/update-product-variant.dto';
import UpdateProductVariantRequestDto from './dto/update-product-variant-request.dto';
import { Update_BaseProduct_Req } from './dto/update-bp.dto';
import { BaseProductResponseDto } from './dto/BP.dto';

@Injectable()
export class ProductService {
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

  getAllBaseProducts() {
    return this.productClient.send({ cmd: 'get-all-base-products' }, {});
  }

  getBySlug(slug: string) {
    return this.productClient
      .send({ cmd: 'get-base-product-by-slug' }, slug)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
        map(async (response) => {
          return response;
        }),
      );
  }

  async getBPBySlug(slug: string) {
    const baseProduct = await firstValueFrom(
      this.productClient
        .send({ cmd: 'get-base-product-by-slug-client' }, slug)
        .pipe(
          catchError((error) => {
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response as BaseProductResponseDto;
          }),
        ),
    );

    const productVariantIds = baseProduct.productVariants.map(
      (item) => item.id,
    );

    const reviewSummary = await firstValueFrom(
      this.reviewClient
        .send({ cmd: 'get-review-summary' }, productVariantIds)
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
        .send({ cmd: 'get-order-summary' }, productVariantIds)
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

    baseProduct.averageRating = reviewSummary.averageRating;
    baseProduct.numberOfReviews = reviewSummary.numberOfReviews;
    baseProduct.numberOfPurchases = orderSummary.numberOfPurchases;

    return baseProduct;
  }

  async createBaseProduct(data: CreateBaseProductDto) {
    const fileBuffers = data.images.map((item) => item.buffer);
    const UploadRes: UploadResponse[] = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response as UploadResponse[];
        }),
      ),
    );

    if (UploadRes.length > 0) {
      let categoryIds = [];
      if (data.categoryIds != null && typeof data.categoryIds == 'string') {
        categoryIds.push(Number.parseInt(data.categoryIds));
      } else if (Array.isArray(data.categoryIds)) {
        categoryIds = data.categoryIds.map((item) => Number.parseInt(item));
      }

      const images = UploadRes.map(
        (item) => ({ id: item.id, image: item.path }) as createBPImage,
      );

      const request: CreateBaseProductRequestDto = {
        name: data.name,
        images: images,
        description: data.description,
        categoryIds: categoryIds,
        brandId: Number.parseInt(data.brandId),
        mainImageId: Number.parseInt(data.mainImageId),
      };
      return this.productClient
        .send({ cmd: 'create-base-product' }, request)
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        );
    }
  }

  async updateBaseProduct(data: Update_BaseProduct_Req) {
    return this.productClient.send({ cmd: 'update-base-product' }, data).pipe(
      catchError((error) => {
        console.log(error);
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async createOptionValues(data: CreateOptionValuesDto) {
    return this.productClient.send({ cmd: 'create-option-values' }, data).pipe(
      catchError((error) => {
        console.log(error);
        return throwError(() => new RpcException(error.response));
      }),
      map(async (response) => {
        return response;
      }),
    );
  }

  async createProductVariant(data: CreateProductVariantDto) {
    const fileBuffers = [data.image.buffer];
    const UploadRes: UploadResponse[] = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response as UploadResponse[];
        }),
      ),
    );

    if (UploadRes.length > 0) {
      let optionValueIds = [];
      if (
        data.optionValueIds != null &&
        typeof data.optionValueIds == 'string'
      ) {
        optionValueIds.push(Number.parseInt(data.optionValueIds));
      } else if (Array.isArray(data.optionValueIds)) {
        optionValueIds = data.optionValueIds.map((optionValue) =>
          Number.parseInt(optionValue),
        );
      }

      const request: CreateProductVariantRequestDto = {
        baseProductId: Number.parseInt(data.baseProductId),
        image: UploadRes[0].path,
        imageId: UploadRes[0].id,
        quantity: Number.parseInt(data.quantity),
        price: Number.parseFloat(data.price),
        optionValueIds: optionValueIds,
      };

      return this.productClient
        .send({ cmd: 'create-product-variant' }, request)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map(async (response) => {
            return response;
          }),
        );
    }
  }

  async updateProductVariant(data: UpdateProductVariantDto) {
    if (data.image) {
      // delete exist image
      await firstValueFrom(
        this.mediaClient.send({ cmd: 'delete-image' }, data.imageId).pipe(
          defaultIfEmpty(null), // Trả về null nếu không có phần tử nào
        ),
      );

      const fileBuffers = [data.image.buffer];
      const UploadRes: UploadResponse[] = await firstValueFrom(
        this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => {
            return response as UploadResponse[];
          }),
        ),
      );

      if (UploadRes.length > 0) {
        data.imageUrl = UploadRes[0].path;
        data.imageId = UploadRes[0].id;
      }
    }

    const request: UpdateProductVariantRequestDto = {
      productVariantId: Number.parseInt(data.productVariantId),
      image: data.imageUrl,
      imageId: data.imageId,
      quantity: Number.parseInt(data.quantity),
      price: Number.parseFloat(data.price),
    };

    return this.productClient
      .send({ cmd: 'update-product-variant' }, request)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      );
  }

  async deleteBPImage(publicId: string) {
    if (!!publicId) {
      await firstValueFrom(
        this.mediaClient.send({ cmd: 'delete-image' }, publicId).pipe(
          defaultIfEmpty(null), // Trả về null nếu không có phần tử nào
        ),
      );

      return this.productClient
        .send({ cmd: 'delete-base-product-image' }, publicId)
        .pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
        );
    }
  }

  async addBPImage(data: AddBPImage) {
    const fileBuffers = data.images.map((item) => item.buffer);
    const UploadRes: UploadResponse[] = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response as UploadResponse[];
        }),
      ),
    );

    if (UploadRes.length > 0) {
      const images = UploadRes.map(
        (item) => ({ id: item.id, image: item.path }) as createBPImage,
      );

      const request: Add_BP_Image_Req = {
        baseProductId: Number.parseInt(data.baseProductId),
        images: images,
      };

      return this.productClient
        .send({ cmd: 'add-base-product-image' }, request)
        .pipe(
          catchError((error) => {
            console.log(error);
            return throwError(() => new RpcException(error.response));
          }),
          map(async (response) => {
            return response;
          }),
        );
    }
  }

  async setBPMainImage(baseProductId: number, imageId: number) {
    return this.productClient
      .send({ cmd: 'set-base-product-main-image' }, { baseProductId, imageId })
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
      );
  }

  async updateBaseProductStatus(data: Update_BaseProduct_Req) {
    return this.productClient
      .send({ cmd: 'update-base-product-status' }, data)
      .pipe(
        catchError((error) => {
          console.log(error);
          return throwError(() => new RpcException(error.response));
        }),
      );
  }

  async getProductsByCategorySlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ) {
    const products = await firstValueFrom(
      this.productClient
        .send(
          { cmd: 'get-base-product-by-category-slug' },
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
      products.map(async (product) => {
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

    return products;
  }

  async getProductsByBrandSlug(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ) {
    const products = await firstValueFrom(
      this.productClient
        .send(
          { cmd: 'get-base-product-by-brand-slug' },
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
      products.map(async (product) => {
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

    return products;
  }

  async searchProductByName(
    slug: string,
    fromPrice?: number,
    toPrice?: number,
    sortBy: string = 'bestSelling',
    page: number = 1,
    limit: number = 20,
  ) {
    const products = await firstValueFrom(
      this.productClient
        .send(
          { cmd: 'search-base-product-by-name' },
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
      products.map(async (product) => {
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

    return products;
  }
}
