export class CreateOrderDetailDto {
  productVariantId: number;
  quantity: number;
  price: number;
}

export class CreateOrderDto {
  note: string;
  paymentMethod: string;
  paymentDate: string | null;
  transactionId: string | null;
  receiverName: string;
  receiverAddress: string;
  receiverPhoneNumber: string;
  orderDetails: CreateOrderDetailDto[];
}
