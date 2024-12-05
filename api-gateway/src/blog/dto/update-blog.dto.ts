import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class UpdateBlog {
  @IsString()
  @IsNotEmpty()
  id: string;

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

  @IsString()
  @IsNotEmpty()
  existImage: string;

  @IsString()
  @IsNotEmpty()
  existImageId: string;

  newImage: Express.Multer.File;
}
