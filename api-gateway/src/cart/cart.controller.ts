import { Controller, Get, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  getCartByUserId(@GetUser('id') userId: number) {
    return this.cartService.getCartByUserId(userId);
  }
}
