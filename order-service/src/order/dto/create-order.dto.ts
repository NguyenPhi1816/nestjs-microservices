import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateOrderDetailDto } from './create-order-detail.dto';

export class CreateOrderDto {
  @IsString()
  note: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  paymentDate: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  transactionId: string | null;

  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsNotEmpty()
  receiverPhoneNumber: string;

  @IsInt()
  voucherId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  totalAmount: number;
}
