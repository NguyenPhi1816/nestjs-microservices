import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';

export class Update_BP_Req {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  categoryIds: number[];

  @IsInt()
  @IsNotEmpty()
  brandId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images: string[];

  @IsInt()
  @IsNotEmpty()
  mainImageId: number;
}
