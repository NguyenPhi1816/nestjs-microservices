import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewRequestDto {
  @IsInt()
  @IsNotEmpty()
  orderDetailId: number;

  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsOptional()
  @IsString()
  comment: string | null;
}
