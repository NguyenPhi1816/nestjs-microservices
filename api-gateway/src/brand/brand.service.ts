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
}
