import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class CreateBlog {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  image: Express.Multer.File;
}
