import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class DeteleReviewParams {
  @Type(() => Number)
  @IsInt()
  reviewId: number;
}
