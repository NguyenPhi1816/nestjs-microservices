import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';
import { MessagePattern } from '@nestjs/microservices';
import { AddToCartRequestDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityRequestDto } from './dto/update-cart-quantity.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'get-cart' })
  async getOrderSummary(userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @MessagePattern({ cmd: 'add-to-cart' })
  async addProductToCart(data: {
    userId: number;
    addToCartDto: AddToCartRequestDto;
    remainingQuantity: number;
  }) {
    return this.cartService.addProductToCart(
      data.userId,
      data.addToCartDto,
      data.remainingQuantity,
    );
  }

  @MessagePattern({ cmd: 'update-cart-quantity' })
  async updateCartQuantity(data: {
    userId: number;
    productVariantId: number;
    updateCartQuantityRequestDto: UpdateCartQuantityRequestDto;
    remainingQuantity: number;
  }) {
    return this.cartService.updateCartQuantity(
      data.userId,
      data.productVariantId,
      data.updateCartQuantityRequestDto,
      data.remainingQuantity,
    );
  }

  @MessagePattern({ cmd: 'delete-cart' })
  deleteCart(data: { userId: number; productVariantId: number }) {
    return this.cartService.deleteCart(data.userId, data.productVariantId);
  }
}
