import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/constants/order-status.enum';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';
import { PaymentStatus } from './dto/payment-status.enum';
import { OrderDto } from './dto/order.dto';
import { OrderDetailDto } from './dto/order-detail.dto';
import { OrderPaymentDto } from './dto/order-payment.dto';
import { PaymentMethod } from './dto/payment-method.enum';
import { OrderResponse } from './dto/order-response.dto';
import { OrderDetailResponse } from './dto/order-detail-response.dto';
import { PaymentResponse } from './dto/payment-response.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getAllOrders() {
    try {
      const orders = await this.prisma.order.findMany();
      const response = orders.sort(
        (a, b) =>
          new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // save order
        const order = await prisma.order.create({
          data: {
            userId: userId,
            status: OrderStatus.PENDING,
            createAt: new Date(),
            note: createOrderDto.note,
            receiverName: createOrderDto.receiverName,
            receiverAddress: createOrderDto.receiverAddress,
            receiverPhoneNumber: createOrderDto.receiverPhoneNumber,
          },
        });

        // create order details
        const orderDetailPromises = createOrderDto.orderDetails.map(
          (orderDetail) =>
            prisma.orderDetail.create({
              data: {
                orderId: order.id,
                productVariantId: orderDetail.productVariantId,
                quantity: orderDetail.quantity,
                price: orderDetail.price,
              },
            }),
        );
        const orderDetails = await Promise.all(orderDetailPromises);

        // create payment
        const totalPrice = orderDetails.reduce(
          (prev, detail) => prev + detail.price * detail.quantity,
          0,
        );
        const payment = await prisma.payment.create({
          data: {
            totalPrice: totalPrice,
            paymentMethod: createOrderDto.paymentMethod,
            status: PaymentStatus.PENDING,
            orderId: order.id,
            paymentDate: null,
            transactionId: null,
          },
        });

        return { order, orderDetails, payment };
      });

      const order: OrderDto = {
        id: result.order.id,
        userId: result.order.userId,
        receiverName: result.order.receiverName,
        receiverPhoneNumber: result.order.receiverPhoneNumber,
        receiverAddress: result.order.receiverAddress,
        note: result.order.note,
        createAt: result.order.createAt.toISOString(),
        status: result.order.status as OrderStatus,
      };

      const orderDetails: OrderDetailDto[] = result.orderDetails.map(
        (item) => ({
          id: item.id,
          price: item.price,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        }),
      );

      const payment: OrderPaymentDto = {
        id: result.payment.id,
        paymentMethod: result.payment.paymentMethod as PaymentMethod,
        paymentDate: null,
        totalPrice: result.payment.totalPrice,
        status: result.payment.status as PaymentStatus,
        transactionId: null,
      };

      const response: CreateOrderResponseDto = {
        order,
        orderDetails,
        payment,
      };

      return response;
    } catch (error) {
      throw error;
    }
  }

  async getOrderDetailById(orderId: number): Promise<OrderResponse> {
    try {
      const order = await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          receiverName: true,
          receiverPhoneNumber: true,
          receiverAddress: true,
          note: true,
          createAt: true,
          status: true,
          userId: true,
          orderDetails: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              price: true,
            },
          },
          payment: {
            select: {
              paymentMethod: true,
              paymentDate: true,
              totalPrice: true,
              status: true,
              transactionId: true,
            },
          },
        },
      });

      console.log(order);

      const orderDetails: OrderDetailResponse[] = order.orderDetails.map(
        (orderDetail) => {
          return {
            id: orderDetail.id,
            productVariantId: orderDetail.id,
            quantity: orderDetail.quantity,
            price: orderDetail.price,
          };
        },
      );

      const payment: PaymentResponse = {
        ...order.payment,
        paymentDate: order.payment.paymentDate
          ? order.payment.paymentDate.toISOString()
          : null,
      };

      const response: OrderResponse = {
        id: order.id,
        userId: order.userId,
        receiverName: order.receiverName,
        receiverPhoneNumber: order.receiverPhoneNumber,
        receiverAddress: order.receiverAddress,
        note: order.note,
        createAt: order.createAt.toISOString(),
        status: order.status,
        orderDetails: orderDetails,
        payment: payment,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }
}
