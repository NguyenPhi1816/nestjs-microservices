import { Controller } from '@nestjs/common';
import { BlogService } from './blog.service';
import { MessagePattern } from '@nestjs/microservices';
import CreateBlogCategoryDto from './dto/create-category.dto';
import UpdateBlogCategoryDto from './dto/update-category.dto';
import CreateBlog from './dto/create-blog.dto';
import UpdateBlog from './dto/update-blog.dto';
import UpdateBlogStatus from './dto/update-status.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @MessagePattern({ cmd: 'get-all-blog-category' })
  getAllBlogCategory() {
    return this.blogService.getAllBlogCategory();
  }

  @MessagePattern({ cmd: 'create-blog-category' })
  createBlogCategory(data: CreateBlogCategoryDto) {
    return this.blogService.createBlogCategory(data);
  }

  @MessagePattern({ cmd: 'update-blog-category' })
  updateBlogCategory(data: UpdateBlogCategoryDto) {
    return this.blogService.updateBlogCategory(data);
  }

  @MessagePattern({ cmd: 'get-category-blog' })
  getCategoryBlogs(categoryId: number) {
    return this.blogService.getCategoryBlog(categoryId);
  }

  @MessagePattern({ cmd: 'create-blog' })
  createBlog(data: CreateBlog) {
    return this.blogService.createBlog(data);
  }

  @MessagePattern({ cmd: 'update-blog' })
  updateBlog(data: UpdateBlog) {
    return this.blogService.updateBlog(data);
  }

  @MessagePattern({ cmd: 'update-blog-status' })
  updateBlogStatus(data: UpdateBlogStatus) {
    return this.blogService.updateBlogStatus(data);
  }

  @MessagePattern({ cmd: 'get-blog-detail' })
  getBlogDetail(blogId: number) {
    return this.blogService.getBlogDetail(blogId);
  }

  @MessagePattern({ cmd: 'get-top-blogs' })
  getTopBlogs() {
    return this.blogService.getTopBlogs();
  }

  @MessagePattern({ cmd: 'get-blog-by-slug' })
  getBlogBySlug(slug: string) {
    return this.blogService.getBlogBySlug(slug);
  }

  @MessagePattern({ cmd: 'get-list-category-blogs' })
  getListCategoryBlogs() {
    return this.blogService.getListCategoryBlogs();
  }

  @MessagePattern({ cmd: 'get-blogs-by-category-id' })
  getBlogsByCategoryId(categoryId: number) {
    return this.blogService.getBlogsByCategoryId(categoryId);
  }
}
