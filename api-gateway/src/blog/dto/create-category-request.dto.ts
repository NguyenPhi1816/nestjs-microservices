import { IsNotEmpty, IsString } from 'class-validator';

export default class CreateBlogCategoryRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  imageId: string;
}
