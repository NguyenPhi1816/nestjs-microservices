import { OptionValuesDto } from './option-values.dto';

export class CreateOptionValuesDto {
  baseProductId: number;
  optionValues: OptionValuesDto[];
}
