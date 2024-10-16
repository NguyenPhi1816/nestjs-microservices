import { IsInt, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export default class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  imageId: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @ValidateIf((object, value) => value !== null)
  parentId: number | null;
}
