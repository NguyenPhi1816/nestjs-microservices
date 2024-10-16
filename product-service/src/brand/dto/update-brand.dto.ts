import { IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateBrandDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  imageId: string;
}
