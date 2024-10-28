export class PaymentResponse {
  paymentMethod: string;
  paymentDate: string | null;
  totalPrice: number;
  status: string;
  transactionId: string | null;
}
