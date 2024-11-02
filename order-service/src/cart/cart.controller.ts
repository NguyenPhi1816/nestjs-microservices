import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'get-cart' })
  async getOrderSummary(userId: number) {
    return this.cartService.getCartByUserId(userId);
  }
}
