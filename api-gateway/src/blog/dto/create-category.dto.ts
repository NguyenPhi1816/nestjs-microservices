import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateBlogCategory {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  image: Express.Multer.File;
}
