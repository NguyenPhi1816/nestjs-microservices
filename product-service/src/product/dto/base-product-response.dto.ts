import { IsArray, IsInt, IsString } from 'class-validator';

export class BaseProductResponseDto {
  @IsInt()
  id: number;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsString()
  brand: string;

  @IsString()
  status: string;
}
