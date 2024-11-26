import { NotificationType } from 'src/constrants/enum/notification-type.enum';

export default class CreateNotificationDto {
  userId: number;
  type: NotificationType;
  message: string;
  receiverEmail: string;
}
