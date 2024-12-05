import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import CreateBlogCategory from './dto/create-category.dto';
import UpdateBlogCategory from './dto/update-category.dto';
import CreateBlog from './dto/create-blog.dto';
import UpdateBlog from './dto/update-blog.dto';
import UpdateBlogStatus from './dto/update-status.dto';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('category')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllBlogCategory() {
    return this.blogService.getAllBlogCategory();
  }

  @Post('category')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  createBlogCategory(
    @Body() data: CreateBlogCategory,
    @UploadedFile() file: Express.Multer.File,
  ) {
    data.image = file;
    return this.blogService.createBlogCategory(data);
  }

  @Put('category')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('newImage'))
  async updateBlogCategory(
    @Body() data: UpdateBlogCategory,
    @UploadedFile() file: Express.Multer.File,
  ) {
    data.newImage = file;
    return this.blogService.updateBlogCategory(data);
  }

  @Get('category/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCategoryBlog(@Param() param: { id: string }) {
    return this.blogService.getCategoryBlog(Number.parseInt(param.id));
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  createBlog(
    @Body() data: CreateBlog,
    @GetUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    data.image = file;
    return this.blogService.createBlog(userId, data);
  }

  @Put()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('newImage'))
  async updateBlog(
    @Body() data: UpdateBlog,
    @GetUser('id') userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    data.newImage = file;
    return this.blogService.updateBlog(userId, data);
  }

  @Put('status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateBlogStatus(@Body() data: UpdateBlogStatus) {
    return this.blogService.updateBlogStatus(data);
  }

  @Get('detail/:id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getBlogDetail(@Param() data: { id: string }) {
    return this.blogService.getBlogDetail(Number.parseInt(data.id));
  }

  @Get('client/top-blogs')
  async getTopBlogs() {
    return this.blogService.getTopBlogs();
  }

  @Get('client/blog/:slug')
  async getBlogBySlug(@Param() data: { slug: string }) {
    return this.blogService.getBlogBySlug(data.slug);
  }

  @Get('client/list-category-blogs')
  async getListCategoryBlogs() {
    return this.blogService.getListCategoryBlogs();
  }

  @Get('client/category-blogs/:id')
  async getBlogsByCategoryId(@Param() data: { id: string }) {
    return this.blogService.getBlogsByCategoryId(Number.parseInt(data.id));
  }
}
