import { OrderDetailResult } from './order-detail-result.dto';
import { PaymentResponse } from './payment-response.dto';

export class OrderResult {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: string;
  orderDetails: OrderDetailResult[];
  payment: PaymentResponse;
}
