import { OptionValueResponseDto } from './option-value-response.dto';

export class ProductVariantResponseDto {
  id: number;
  image: string;
  quantity: number;
  optionValue: OptionValueResponseDto[];
  price: number;
}
