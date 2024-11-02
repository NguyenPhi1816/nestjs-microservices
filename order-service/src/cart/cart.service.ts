import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCartByUserId(userId: number) {
    try {
      const carts = await this.prisma.cart.findMany({
        where: { userId: userId },
        select: {
          productVariantId: true,
          quantity: true,
        },
      });

      const response: CartResponseDto[] = carts.map((cart) => ({
        productVariantId: cart.productVariantId,
        quantity: cart.quantity,
      }));
      return response;
    } catch (error) {
      throw error;
    }
  }
}
