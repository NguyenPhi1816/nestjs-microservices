import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaymentUrlRequestDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsNotEmpty()
  orderDescription: string;
}
