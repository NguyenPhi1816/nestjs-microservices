import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  map,
  throwError,
} from 'rxjs';
import CreateBlogCategoryRequest from './dto/create-category-request.dto';
import CreateBlogCategory from './dto/create-category.dto';
import UploadResponse from 'src/product/dto/upload-response.dto';
import UpdateBlogCategory from './dto/update-category.dto';
import UpdateBlogCategoryRequest from './dto/update-category-request.dto';
import CreateBlog from './dto/create-blog.dto';
import CreateBlogRequest from './dto/create-blog-request.dto';
import UpdateBlog from './dto/update-blog.dto';
import UpdateBlogRequest from './dto/update-blog-request.dto';
import UpdateBlogStatus from './dto/update-status.dto';

@Injectable()
export class BlogService {
  private blogClient: ClientProxy;
  private mediaClient: ClientProxy;
  private userClient: ClientProxy;

  constructor(private configService: ConfigService) {
    this.blogClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('BLOG_SERVICE_HOST'),
        port: configService.get('BLOG_SERVICE_PORT'),
      },
    });
    this.mediaClient = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.get('MEDIA_SERVICE_HOST'),
        port: configService.get('MEDIA_SERVICE_PORT'),
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

  async getAllBlogCategory() {
    return this.blogClient.send({ cmd: 'get-all-blog-category' }, {}).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map((response) => {
        return response;
      }),
    );
  }

  async createBlogCategory(data: CreateBlogCategory) {
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
      const request: CreateBlogCategoryRequest = {
        name: data.name,
        description: data.name,
        image: uploadRes[0].path,
        imageId: uploadRes[0].id,
      };
      return this.blogClient
        .send({ cmd: 'create-blog-category' }, request)
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

  async updateBlogCategory(data: UpdateBlogCategory) {
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

    const request: UpdateBlogCategoryRequest = {
      id: Number.parseInt(data.id),
      name: data.name,
      description: data.description,
      image: data.existImage,
      imageId: data.existImageId,
    };
    return this.blogClient.send({ cmd: 'update-blog-category' }, request).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getCategoryBlog(categoryId: number) {
    return this.blogClient.send({ cmd: 'get-category-blog' }, categoryId).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async createBlog(userId: number, data: CreateBlog) {
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
      const request: CreateBlogRequest = {
        title: data.title,
        summary: data.summary,
        content: data.content,
        categoryId: Number.parseInt(data.categoryId),
        userId: userId,
        image: uploadRes[0].path,
        imageId: uploadRes[0].id,
      };
      return this.blogClient.send({ cmd: 'create-blog' }, request).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      );
    }
  }

  async updateBlog(userId: number, data: UpdateBlog) {
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

    const request: UpdateBlogRequest = {
      id: Number.parseInt(data.id),
      title: data.title,
      summary: data.summary,
      content: data.content,
      categoryId: Number.parseInt(data.categoryId),
      userId: userId,
      image: data.existImage,
      imageId: data.existImageId,
    };
    return this.blogClient.send({ cmd: 'update-blog' }, request).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async updateBlogStatus(data: UpdateBlogStatus) {
    return this.blogClient.send({ cmd: 'update-blog-status' }, data).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getBlogDetail(blogId: number) {
    return this.blogClient.send({ cmd: 'get-blog-detail' }, blogId).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  getTopBlogs() {
    return this.blogClient.send({ cmd: 'get-top-blogs' }, {}).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  async getBlogBySlug(slug: string) {
    const blog = await firstValueFrom(
      this.blogClient.send({ cmd: 'get-blog-by-slug' }, slug).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      ),
    );

    const author = await firstValueFrom(
      this.userClient.send({ cmd: 'get-profile' }, blog.userId).pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
        map(async (response) => {
          return response;
        }),
      ),
    );

    blog.author = author.firstName + ' ' + author.lastName;
    delete blog.userId;

    return blog;
  }

  getListCategoryBlogs() {
    return this.blogClient.send({ cmd: 'get-list-category-blogs' }, {}).pipe(
      catchError((error) => throwError(() => new RpcException(error.response))),
      map(async (response) => {
        return response;
      }),
    );
  }

  getBlogsByCategoryId(categoryId: number) {
    return this.blogClient
      .send({ cmd: 'get-blogs-by-category-id' }, categoryId)
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
