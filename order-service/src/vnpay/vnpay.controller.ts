import { Controller, Get, Query, Render } from '@nestjs/common';
import { VnpayService } from './vnpay.service';
import { CreatePaymentUrlRequestDto } from './dto/request';
import { MessagePattern } from '@nestjs/microservices';

@Controller('api/vnpay')
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}

  @MessagePattern({ cmd: 'create_payment_url' })
  createPaymentUrl(data: CreatePaymentUrlRequestDto) {
    const { amount, orderId, orderDescription } = data;
    return this.vnpayService.createPaymentUrl(
      amount,
      orderId,
      orderDescription,
    );
  }

  @MessagePattern({ cmd: 'vnpay-return' })
  async vnpayReturn(query: any) {
    const code = await this.vnpayService.verifyReturnUrl(query);
    if (code === '00') {
      return { status: 'success', code };
    } else {
      return { status: 'failed', code };
    }
  }
}
