import { Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, throwError } from 'rxjs';

@Controller('api/products')
export class ProductController {
  constructor(@Inject('PRODUCT_SERVICE') private client: ClientProxy) {}

  @Post('hello')
  hello() {
    console.log('Hello');
    return this.client.send({ cmd: 'hello' }, {});
  }
}
