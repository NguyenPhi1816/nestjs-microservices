import { OrderDetailDto } from './order-detail.dto';
import { OrderPaymentDto } from './order-payment.dto';
import { OrderDto } from './order.dto';

export type CreateOrderResponseDto = {
  order: OrderDto;
  orderDetails: OrderDetailDto[];
  payment: OrderPaymentDto;
};
