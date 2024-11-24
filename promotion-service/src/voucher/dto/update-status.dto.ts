import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { VoucherStatus } from 'src/constants/voucher-status.enum';

export default class UpdateVoucherStatus {
  @IsInt()
  @IsNotEmpty()
  voucherId: number;

  @IsEnum(VoucherStatus)
  @IsNotEmpty()
  status: VoucherStatus;
}
