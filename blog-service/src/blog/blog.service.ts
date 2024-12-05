import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateBlogCategoryDto from './dto/create-category.dto';
import UpdateBlogCategoryDto from './dto/update-category.dto';
import CreateBlog from './dto/create-blog.dto';
import UpdateBlog from './dto/update-blog.dto';
import UpdateBlogStatus from './dto/update-status.dto';
import { RpcException } from '@nestjs/microservices';
import { normalizeName } from 'src/utils/normalize-name.util';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getAllBlogCategory() {
    const blogCategories = await this.prisma.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createAt: true,
        image: true,
        imageId: true,
      },
    });

    return blogCategories;
  }

  async createBlogCategory(data: CreateBlogCategoryDto) {
    const blogCategory = await this.prisma.blogCategory.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        imageId: data.imageId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createAt: true,
        image: true,
        imageId: true,
      },
    });

    return blogCategory;
  }

  async updateBlogCategory(data: UpdateBlogCategoryDto) {
    const blogCategory = await this.prisma.blogCategory.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        imageId: data.imageId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createAt: true,
        image: true,
        imageId: true,
      },
    });

    return blogCategory;
  }

  async getCategoryBlog(categoryId: number) {
    const blogs = await this.prisma.blog.findMany({
      where: {
        categoryId: categoryId,
      },
      orderBy: {
        createAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        createAt: true,
        updateAt: true,
        userId: true,
      },
    });

    return blogs;
  }

  async createBlog(data: CreateBlog) {
    const existBlog = await this.prisma.blog.findUnique({
      where: {
        title: data.title,
      },
    });

    if (existBlog) {
      throw new RpcException(new ConflictException('Tên bài viết đã tồn tại'));
    }

    const blog = await this.prisma.blog.create({
      data: {
        title: data.title,
        slug: normalizeName(data.title),
        summary: data.summary,
        content: data.content,
        image: data.image,
        imageId: data.imageId,
        userId: data.userId,
        categoryId: data.categoryId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createAt: true,
        updateAt: true,
        userId: true,
      },
    });

    return blog;
  }

  async updateBlog(data: UpdateBlog) {
    const existBlog = await this.prisma.blog.findUnique({
      where: {
        title: data.title,
      },
    });

    if (existBlog && existBlog.id != data.id) {
      throw new RpcException(new ConflictException('Tên bài viết đã tồn tại'));
    }

    const blog = await this.prisma.blog.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        slug: normalizeName(data.title),
        summary: data.summary,
        content: data.content,
        image: data.image,
        imageId: data.imageId,
        userId: data.userId,
        categoryId: data.categoryId,
        updateAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        status: true,
        createAt: true,
        updateAt: true,
        userId: true,
      },
    });

    return blog;
  }

  async updateBlogStatus(data: UpdateBlogStatus) {
    const blog = await this.prisma.blog.update({
      where: {
        id: data.id,
      },
      data: {
        status: data.status,
      },
    });
    return blog;
  }

  async getBlogDetail(blogId: number) {
    const blog = this.prisma.blog.findUnique({
      where: {
        id: blogId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        imageId: true,
        summary: true,
        createAt: true,
        updateAt: true,
        status: true,
        userId: true,
      },
    });

    return blog;
  }

  async getTopBlogs() {
    const blogs = this.prisma.blog.findMany({
      where: {
        status: 'ACTIVE',
      },
      take: 5,
      orderBy: {
        createAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        image: true,
        summary: true,
        createAt: true,
        slug: true,
      },
    });

    return blogs;
  }

  async getBlogBySlug(slug: string) {
    const blog = this.prisma.blog.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        title: true,
        content: true,
        image: true,
        imageId: true,
        summary: true,
        createAt: true,
        updateAt: true,
        status: true,
        userId: true,
        slug: true,
      },
    });

    return blog;
  }

  async getListCategoryBlogs() {
    return this.prisma.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createAt: true,
        image: true,
        imageId: true,
        blogs: {
          where: {
            status: 'ACTIVE',
          },
          take: 5,
          orderBy: {
            createAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            image: true,
            summary: true,
            createAt: true,
            slug: true,
          },
        },
      },
    });
  }

  async getBlogsByCategoryId(categoryId: number) {
    return this.prisma.blogCategory.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createAt: true,
        image: true,
        imageId: true,
        blogs: {
          where: {
            status: 'ACTIVE',
          },
          take: 5,
          orderBy: {
            createAt: 'desc',
          },
          select: {
            id: true,
            title: true,
            image: true,
            summary: true,
            createAt: true,
            slug: true,
          },
        },
      },
    });
  }
}
