import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { CreateBrandDto } from './dto/create-brand.dto';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { CreateBrandRequestDto } from './dto/create-brand-request.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { UpdateBrandRequestDto } from './dto/update-brand-request.dto';

@Injectable()
export class BrandService {
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

  async getAllBrands() {
    return this.productClient.send({ cmd: 'get-all-brands' }, {});
  }

  async createBrand(data: CreateBrandDto) {
    const fileBuffers = [data.image.buffer];
    console.log(fileBuffers);
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
      const request: CreateBrandRequestDto = {
        name: data.name,
        image: path,
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
      const fileBuffers = [data.newImage.buffer];
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
        data.existImage = path;
      }
    }

    const request: UpdateBrandRequestDto = {
      id: Number.parseInt(data.id),
      name: data.name,
      image: data.existImage,
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
}
