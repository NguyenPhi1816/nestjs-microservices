import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import CreateCategoryDto from './dto/create-category.dto';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import CreateCategoryRequestDto from './dto/create-category-request.dto';
import UpdateCategoryDto from './dto/update-category.dto';
import UpdateCategoryRequestDto from './dto/update-category-request.dto';

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
      const request: CreateCategoryRequestDto = {
        name: data.name,
        image: path,
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

    const request: UpdateCategoryRequestDto = {
      id: data.id,
      name: data.name,
      image: data.existImage,
      description: data.description,
      parentId: data.parentId ? Number.parseInt(data.parentId) : null,
    };
    return this.productClient.send({ cmd: 'update-category' }, request).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }
}
