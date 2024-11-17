export default class CreateVoucherDto {
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscountValue: number;
  usageLimit: number;
  status: string;
  promotionId: number;
}
