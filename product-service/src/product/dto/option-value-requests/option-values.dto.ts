import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class OptionValuesDto {
  @IsString()
  @IsNotEmpty()
  option: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];
}
