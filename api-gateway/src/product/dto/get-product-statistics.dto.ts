import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

export default class GetProductStatisticsDto {
  productId: number;
  fromDate: string;
  toDate: string;
  type: UserActivity;
}
