import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export default class UpdateProductVariantDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsUrl()
  image: string;

  @IsString()
  imageId: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;
}
