import { OrderStatus } from 'src/constants/order-status.enum';

export type OrderDto = {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhoneNumber: string;
  receiverAddress: string;
  note: string;
  createAt: string;
  status: OrderStatus;
};
