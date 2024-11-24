export default class CreateDiscountDto {
  type: string;
  value: number;
  promotionId: number;
  appliedProductIds: number[];
}
