import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dto/create-order.dto';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { GetUser } from 'src/auth/decorator/get-user.decorator';

@Controller('api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Get('/detail/:id')
  @UseGuards(AccessTokenGuard)
  getOrderDetailById(@Param() param: { id: number }) {
    return this.orderService.getOrderDetailById(param.id);
  }

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createOrder(@GetUser('id') userId: number, @Body() data: CreateOrderDto) {
    return this.orderService.createOrder(userId, data);
  }

  @Put('/:orderId/:status')
  @UseGuards(AccessTokenGuard)
  updateOrder(@Param() params: { orderId: string; status: string }) {
    const orderId = Number.parseInt(params.orderId);
    return this.orderService.updateOrder(orderId, params.status);
  }
}
