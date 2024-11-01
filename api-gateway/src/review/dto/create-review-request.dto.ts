export class CreateReviewRequestDto {
  orderDetailId: number;
  productVariantId: number;
  userId: number;
  rating: number;
  comment: string | null;
}
