import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreateCategoryDto from './dto/create-category.dto';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  map,
  throwError,
} from 'rxjs';
import CreateCategoryRequestDto from './dto/create-category-request.dto';
import UpdateCategoryDto from './dto/update-category.dto';
import UpdateCategoryRequestDto from './dto/update-category-request.dto';
import UploadResponse from './dto/upload-response.dto';

@Injectable()
export class CategoryService {
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

  async getAllCategories() {
    return this.productClient.send({ cmd: 'get-all-categories' }, {});
  }

  async createCategory(data: CreateCategoryDto) {
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
      const request: CreateCategoryRequestDto = {
        name: data.name,
        image: uploadRes[0].path,
        imageId: uploadRes[0].id,
        description: data.description,
        parentId: data.parentId ? Number.parseInt(data.parentId) : null,
      };
      return this.productClient.send({ cmd: 'create-category' }, request).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      );
    }
  }

  async updateCategory(data: UpdateCategoryDto) {
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

      // upload new image to cloudinary
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
        data.existImageId = uploadRes[0].id;
        data.existImage = uploadRes[0].path;
      }
    }

    const request: UpdateCategoryRequestDto = {
      id: Number.parseInt(data.id),
      name: data.name,
      image: data.existImage,
      imageId: data.existImageId,
      description: data.description,
      parentId: data.parentId ? Number.parseInt(data.parentId) : null,
    };

    console.log(request);

    return this.productClient.send({ cmd: 'update-category' }, request).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  getCategoryChildren(slug: string) {
    return this.productClient.send({ cmd: 'get-category-children' }, slug);
  }

  getCategoryProducts(slug: string) {
    return this.productClient.send({ cmd: 'get-category-products' }, slug);
  }
}
