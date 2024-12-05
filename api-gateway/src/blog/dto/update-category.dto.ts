import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class UpdateBlogCategory {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  existImage: string;

  @IsString()
  @IsNotEmpty()
  existImageId: string;

  newImage: Express.Multer.File;
}
