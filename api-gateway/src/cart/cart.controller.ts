import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AddToCartRequestDto } from './dto/add-to-cart.dto';
import { UpdateCartQuantityRequestDto } from './dto/update-cart-quantity.dto';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getCartByUserId(@GetUser('id') userId: number) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  addProductToCart(
    @GetUser('id') userId: number,
    @Body() addToCartRequestDto: AddToCartRequestDto,
  ) {
    return this.cartService.addProductToCart(userId, addToCartRequestDto);
  }

  @Patch('/:productVariantId')
  @UseGuards(AccessTokenGuard)
  updateCartDetailQuantity(
    @GetUser('id') userId: number,
    @Param()
    params: {
      productVariantId: string;
    },
    @Body() updateCartQuantityRequestDto: UpdateCartQuantityRequestDto,
  ) {
    return this.cartService.updateCartQuantity(
      userId,
      Number.parseInt(params.productVariantId),
      updateCartQuantityRequestDto,
    );
  }

  @Delete('/:productVariantId')
  @UseGuards(AccessTokenGuard)
  deleteCartDetail(
    @GetUser('id') userId: number,
    @Param()
    params: {
      productVariantId: string;
    },
  ) {
    return this.cartService.deleteCart(
      userId,
      Number.parseInt(params.productVariantId),
    );
  }
}
