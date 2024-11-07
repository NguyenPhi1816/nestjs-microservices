import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { UpdateCartType } from 'src/constrants/enum/update-cart-type.enum';

export class UpdateCartQuantityRequestDto {
  type: UpdateCartType;
  quantity: number;
}
