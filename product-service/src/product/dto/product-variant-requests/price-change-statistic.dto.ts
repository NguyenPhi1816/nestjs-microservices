import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export default class PriceChangeStatisticsDto {
  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  toDate: string;
}
