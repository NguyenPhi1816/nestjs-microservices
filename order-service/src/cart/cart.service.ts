import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { RpcException } from '@nestjs/microservices';
import { AddToCartRequestDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityRequestDto } from './dto/update-cart-quantity.dto';
import { UpdateCartType } from 'src/constants/update-cart-type.enum';

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

  async addProductToCart(
    userId: number,
    addToCartDto: AddToCartRequestDto,
    remainingQuantity: number,
  ) {
    try {
      const existedCart = await this.prisma.cart.findUnique({
        where: {
          cartId: {
            userId: userId,
            productVariantId: addToCartDto.productVariantId,
          },
        },
      });

      if (existedCart) {
        if (remainingQuantity >= existedCart.quantity + addToCartDto.quantity) {
          await this.prisma.cart.update({
            where: {
              cartId: {
                userId: existedCart.userId,
                productVariantId: existedCart.productVariantId,
              },
            },
            data: {
              quantity: {
                increment: addToCartDto.quantity,
              },
            },
          });
        } else {
          throw new RpcException(
            new ConflictException('Số lượng hàng tồn kho không đủ'),
          );
        }
      } else {
        // check if inventory quantity is greater than request quantity
        if (remainingQuantity >= addToCartDto.quantity) {
          await this.prisma.cart.create({
            data: {
              userId: userId,
              productVariantId: addToCartDto.productVariantId,
              quantity: addToCartDto.quantity,
              create_at: new Date(),
            },
          });
        } else {
          throw new RpcException(
            new ConflictException('Số lượng hàng tồn kho không đủ'),
          );
        }
      }
      const response = await this.getCartByUserId(userId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateCartQuantity(
    userId: number,
    productVariantId: number,
    updateCartQuantityRequestDto: UpdateCartQuantityRequestDto,
    remainingQuantity: number,
  ) {
    try {
      const myCart = await this.prisma.cart.findUnique({
        where: {
          cartId: {
            userId: userId,
            productVariantId: productVariantId,
          },
        },
        select: { quantity: true },
      });

      if (!myCart) {
        throw new RpcException(
          new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng'),
        );
      }

      if (updateCartQuantityRequestDto.type === UpdateCartType.increment) {
        // check if inventory quantity is greater than request quantity
        if (
          remainingQuantity <
          myCart.quantity + updateCartQuantityRequestDto.quantity
        ) {
          throw new RpcException(
            new ConflictException('Số lượng tồn kho không đủ'),
          );
        }
      } else if (
        updateCartQuantityRequestDto.type === UpdateCartType.decrement
      ) {
        const diff = myCart.quantity - updateCartQuantityRequestDto.quantity;
        if (diff === 0) {
          // if request quantity is equal to cart quantity => delete cart
          return this.deleteCart(userId, productVariantId);
        } else if (diff < 0) {
          // if request quantity is greater than cart quantity => not valid request quantity => throw exception
          throw new RpcException(
            new ConflictException('Số lượng giảm không hợp lệ'),
          );
        }
      }

      await this.prisma.cart.update({
        where: {
          cartId: {
            userId: userId,
            productVariantId: productVariantId,
          },
        },
        data: {
          quantity:
            updateCartQuantityRequestDto.type === UpdateCartType.increment
              ? { increment: updateCartQuantityRequestDto.quantity }
              : { decrement: updateCartQuantityRequestDto.quantity },
        },
      });

      const response = await this.getCartByUserId(userId);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deleteCart(userId: number, productVariantId: number) {
    try {
      await this.prisma.cart.delete({
        where: {
          cartId: { userId: userId, productVariantId: productVariantId },
        },
      });
      const response = await this.getCartByUserId(userId);
      return response;
    } catch (error) {
      throw error;
    }
  }
}
