export class CreateReviewDto {
  orderId: number;
  rating: number;
  comment: string | null;
}
