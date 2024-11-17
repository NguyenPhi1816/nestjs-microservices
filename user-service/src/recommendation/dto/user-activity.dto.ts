import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { UserActivity } from 'src/constrants/enum/user-activity.enum';

export default class UserActivityDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsEnum(UserActivity)
  @IsNotEmpty()
  activityType: UserActivity;
}
