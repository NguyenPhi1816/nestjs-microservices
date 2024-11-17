import { IsNotEmpty, IsString } from 'class-validator';

export default class GetPurchasesStatisticsDto {
  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  toDate: string;
}
