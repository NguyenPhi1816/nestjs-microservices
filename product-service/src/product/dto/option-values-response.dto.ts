import { ValueResponseDto } from './value-resoponse.dto';

export class OptionValuesResponseDto {
  optionId: number;
  optionName: string;
  values: ValueResponseDto[];
}
