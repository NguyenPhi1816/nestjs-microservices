import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsString,
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];
}
