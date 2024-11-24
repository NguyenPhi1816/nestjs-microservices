import { OrderDetailResponse } from './order-detail-response.dto';
import { PaymentResponse } from './payment-response.dto';

export class OrderResponse {
  id: number;
  userId: number;
  userName: string;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: string;
  orderDetails: OrderDetailResponse[];
  payment: PaymentResponse;
  voucher: any;
}
