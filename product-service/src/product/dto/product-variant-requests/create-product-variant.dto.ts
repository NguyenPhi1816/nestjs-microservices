import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsUrl,
  Min,
} from 'class-validator';

export class Create_PV_Req {
  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsInt({ each: true })
  optionValueIds: number[];
}
