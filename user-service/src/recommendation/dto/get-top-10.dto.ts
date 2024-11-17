import { IsEnum, IsIn, IsNotEmpty } from 'class-validator';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

export default class getTop10Dto {
  @IsIn(['top10Products', 'top10Categories'])
  type: string;

  @IsEnum(UserActivity)
  @IsNotEmpty()
  activityType: UserActivity;
}
