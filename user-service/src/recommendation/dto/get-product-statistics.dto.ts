import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

export default class GetProductStatisticsDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  fromDate: string;

  @IsString()
  @IsNotEmpty()
  toDate: string;

  @IsEnum(UserActivity)
  @IsNotEmpty()
  type: UserActivity;
}
