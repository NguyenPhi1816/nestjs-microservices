import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import Create_BP_Image_Req from './create-BP-image.dto';

export class Create_BP_Req {
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
  images: Create_BP_Image_Req[];

  @IsInt()
  @IsNotEmpty()
  mainImageId: number;
}
