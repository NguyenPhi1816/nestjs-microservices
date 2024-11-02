export class ProductVariantResponseDto {
  id: number;
  slug: string;
  name: string;
  variantId: number;
  productVariantIds: number[];
  image: string;
  price: number;
  averageRating: number;
  numberOfReviews: number;
  numberOfPurchases: number;
}
