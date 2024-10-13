import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { CreateBaseProductDto } from './dto/create-product.dto';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { CreateBaseProductRequestDto } from './dto/create-base-product-request.dto';
import { CreateOptionValuesDto } from './dto/create-option-values.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductVariantRequestDto } from './dto/create-product-variant-request.dto';

@Injectable()
export class ProductService {
  private productClient: ClientProxy;
  private mediaClient: ClientProxy;

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

  async createBaseProduct(data: CreateBaseProductDto) {
    const fileBuffers = data.images.map((item) => item.buffer);
    const paths: string[] = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response.paths;
        }),
      ),
    );

    if (!!paths) {
      let categoryIds = [];
      if (data.categoryIds != null && typeof data.categoryIds == 'string') {
        categoryIds.push(Number.parseInt(data.categoryIds));
      } else if (Array.isArray(data.categoryIds)) {
        categoryIds = data.categoryIds.map((item) => Number.parseInt(item));
      }

      const request: CreateBaseProductRequestDto = {
        name: data.name,
        images: paths,
        description: data.description,
        categoryIds: categoryIds,
        brandId: Number.parseInt(data.brandId),
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
    const path: string = await firstValueFrom(
      this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map((response) => {
          return response.paths[0];
        }),
      ),
    );

    if (!!path) {
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
        image: path,
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
}
