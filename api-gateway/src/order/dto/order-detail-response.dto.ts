import { ReviewResponse } from './review-response.dto';

export class OrderDetailResponse {
  id: number;
  productName: string;
  productImage: string;
  optionValue: string[];
  quantity: number;
  price: number;
  review: ReviewResponse | null;
}
