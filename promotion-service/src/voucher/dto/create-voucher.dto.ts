import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { VoucherStatus } from 'src/constants/voucher-status.enum';
import { VoucherType } from 'src/constants/voucher-type.enum';

export default class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(VoucherType)
  @IsNotEmpty()
  type: VoucherType;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @IsNotEmpty()
  minOrderValue: number;

  @IsNumber()
  @IsNotEmpty()
  maxDiscountValue: number;

  @IsInt()
  @IsNotEmpty()
  usageLimit: number;

  @IsEnum(VoucherStatus)
  @IsNotEmpty()
  status: VoucherStatus;

  @IsInt()
  @IsNotEmpty()
  promotionId: number;
}
