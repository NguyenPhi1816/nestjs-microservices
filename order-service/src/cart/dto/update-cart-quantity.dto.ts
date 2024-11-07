import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { UpdateCartType } from 'src/constants/update-cart-type.enum';

export class UpdateCartQuantityRequestDto {
  @IsEnum(UpdateCartType)
  @IsNotEmpty()
  type: UpdateCartType;

  @IsInt()
  @Min(1)
  quantity: number;
}
