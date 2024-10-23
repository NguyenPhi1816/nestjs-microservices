import { PaymentMethod } from './payment-method.enum';
import { PaymentStatus } from './payment-status.enum';

export type OrderPaymentDto = {
  id: number;
  paymentMethod: PaymentMethod;
  paymentDate: string | null;
  totalPrice: number;
  status: PaymentStatus;
  transactionId: string | null;
};
