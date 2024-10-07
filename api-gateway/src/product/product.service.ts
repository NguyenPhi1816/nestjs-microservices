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
      const request: CreateBaseProductRequestDto = {
        name: data.name,
        images: paths,
        description: data.description,
        categoryIds: data.categoryIds.map((item) => Number.parseInt(item)),
        brandId: Number.parseInt(data.brandId),
      };
      console.log(request);
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
      const request: CreateProductVariantRequestDto = {
        baseProductId: Number.parseInt(data.baseProductId),
        image: path,
        quantity: Number.parseInt(data.quantity),
        price: Number.parseFloat(data.price),
        optionValueIds: data.optionValueIds.map((optionValue) =>
          Number.parseInt(optionValue),
        ),
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
