import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { CreatePaymentUrlRequestDto } from './dto/request';
import { catchError, throwError } from 'rxjs';

@Controller('api/vnpay')
export class VnpayController {
  constructor(@Inject('ORDER_SERVICE') private client: ClientProxy) {}

  @UseGuards(AccessTokenGuard)
  @Post('create_payment_url')
  createPaymentUrl(
    @Body()
    body: CreatePaymentUrlRequestDto,
  ) {
    const { amount, orderId, orderDescription } = body;
    return this.client
      .send(
        { cmd: 'create_payment_url' },
        { amount, orderId, orderDescription },
      )
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  // @Get('vnpay_ipn')
  // vnpayIpn(@Query() query: any, @Res() res: Response) {
  //   return this.vnpayService.verifyPayment(query);
  // }

  @Get('vnpay-return')
  @Render('redirect')
  async vnpayReturn(@Query() query: any) {
    return this.client
      .send({ cmd: 'vnpay-return' }, query)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }
}
