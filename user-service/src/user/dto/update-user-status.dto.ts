import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { AccountStatus } from 'src/constrants/enum/account-status.enum';

export class UpdateUserStatusReq {
  @IsNotEmpty()
  userId: number;

  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}
