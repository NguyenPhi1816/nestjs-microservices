import { ReviewDto } from './review.dto';

export class ReviewResponseDto {
  numberOfReviews: number;
  reviews: ReviewDto[];
}
