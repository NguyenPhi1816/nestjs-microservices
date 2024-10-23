import { Controller } from '@nestjs/common';
import { OrderService } from './order.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'get-all-orders' })
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @MessagePattern({ cmd: 'create-order' })
  createOrder(data: { userId: number; dto: CreateOrderDto }) {
    return this.orderService.createOrder(data.userId, data.dto);
  }

  @MessagePattern({ cmd: 'get-order-detail-by-id' })
  getOrderDetailById(orderId: string) {
    const orderIdInt = Number.parseInt(orderId);
    return this.orderService.getOrderDetailById(orderIdInt);
  }
}
