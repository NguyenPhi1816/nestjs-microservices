import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { NotificationType } from 'src/constants/enum/notification-type.enum';

export default class CreateNotification {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEmail()
  @IsNotEmpty()
  receiverEmail: string;
}
