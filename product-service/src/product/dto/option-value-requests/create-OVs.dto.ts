import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { OptionValuesDto } from './option-values.dto';

export class Create_OVs {
  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionValuesDto)
  optionValues: OptionValuesDto[];
}
