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

  @MessagePattern({ cmd: 'update-order' })
  updateOrder(data: { orderId: number; status: string }) {
    return this.orderService.updateOrder(data.orderId, data.status);
  }

  @MessagePattern({ cmd: 'get-order-detail-by-id' })
  getOrderDetailById(orderId: string) {
    const orderIdInt = Number.parseInt(orderId);
    return this.orderService.getOrderDetailById(orderIdInt);
  }

  @MessagePattern({ cmd: 'is-order-ready-for-review' })
  isOrderReadyForReview(orderId: string) {
    const orderIdInt = Number.parseInt(orderId);
    return this.orderService.isOrderReadyForReview(orderIdInt);
  }

  @MessagePattern({ cmd: 'get-order-summary' })
  async getOrderSummary(productVariantIds: number[]) {
    return this.orderService.getOrderSummary(productVariantIds);
  }

  @MessagePattern({ cmd: 'get-order-by-user-id' })
  async getOrderByUserId(userId: number) {
    return this.orderService.getOrdersByUserId(userId);
  }

  @MessagePattern({ cmd: 'get-order-statistic' })
  async getOrderStatistic() {
    return this.orderService.getOrderStatistic();
  }

  @MessagePattern({ cmd: 'get-revenue-by-product-variant-ids' })
  async getRevenueByProductVariantIds(productVariantIds: number[]) {
    return this.orderService.getRevenueByProductVariantIds(productVariantIds);
  }
}
