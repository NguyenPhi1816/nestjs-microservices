import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { RpcException } from '@nestjs/microservices';

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
            voucherId: createOrderDto.voucherId,
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
                discountId: orderDetail.discountId,
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
            totalPrice: createOrderDto.totalAmount,
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
          voucherId: true,
          orderDetails: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              price: true,
              discountId: true,
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

      if (!order) {
        throw new RpcException(
          new NotFoundException('Đơn hàng không tồn tại.'),
        );
      }

      const orderDetails: OrderDetailResponse[] = order.orderDetails.map(
        (orderDetail) => {
          return {
            id: orderDetail.id,
            productVariantId: orderDetail.productVariantId,
            quantity: orderDetail.quantity,
            price: orderDetail.price,
            discountId: orderDetail.discountId,
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
        voucherId: order.voucherId,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(orderId: number, status: string) {
    try {
      const _order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true },
      });

      if (
        _order.status !== OrderStatus.PENDING &&
        _order.status !== OrderStatus.SHIPPING
      ) {
        throw new RpcException(
          new ConflictException('Unable to update order.'),
        );
      }
      const result = await this.prisma.$transaction(async (prisma) => {
        const prismaQuery = {
          id: true,
          userId: true,
          receiverName: true,
          receiverPhoneNumber: true,
          receiverAddress: true,
          note: true,
          createAt: true,
          status: true,
          voucherId: true,
          orderDetails: {
            select: {
              id: true,
              productVariantId: true,
              quantity: true,
              price: true,
              discountId: true,
            },
          },
          payment: {
            select: {
              id: true,
              paymentMethod: true,
              paymentDate: true,
              totalPrice: true,
              status: true,
              transactionId: true,
            },
          },
        };

        switch (status) {
          case OrderStatus.SHIPPING: {
            const order = await prisma.order.update({
              where: {
                id: orderId,
              },
              data: {
                status: OrderStatus.SHIPPING,
              },
              select: prismaQuery,
            });
            return order;
          }
          case OrderStatus.SUCCESS: {
            const order = await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.SUCCESS },
              select: prismaQuery,
            });
            if (order.payment.paymentMethod === PaymentMethod.CASH) {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.SUCCESS,
                  paymentDate: new Date(),
                  transactionId: null,
                },
                select: {
                  paymentMethod: true,
                  paymentDate: true,
                  totalPrice: true,
                  status: true,
                  transactionId: true,
                },
              });
              delete order.payment;
              return { ...order, payment };
            }
            return order;
          }
          case OrderStatus.CANCEL: {
            // update order status to CANCEL
            const order = await prisma.order.update({
              where: { id: orderId },
              data: { status: OrderStatus.CANCEL },
              select: prismaQuery,
            });

            // update payment status to CANCEL (check by cash) or REFUND (check by another method)
            if (order.payment.paymentMethod === PaymentMethod.CASH) {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.CANCEL,
                  paymentDate: null,
                  transactionId: null,
                },
              });
              delete order.payment;
              return { ...order, payment };
            } else {
              const payment = await prisma.payment.update({
                where: { id: order.payment.id },
                data: {
                  status: PaymentStatus.REFUND,
                  paymentDate: new Date(),
                  transactionId: 'refunded-transaction-id',
                },
                select: {
                  paymentMethod: true,
                  paymentDate: true,
                  totalPrice: true,
                  status: true,
                  transactionId: true,
                },
              });
              delete order.payment;
              return { ...order, payment };
            }
          }
          default: {
            throw new RpcException(
              new ConflictException(
                'Có lỗi xảy ra trong quá trình cập nhật trạng thái đơn hàng',
              ),
            );
          }
        }
      });

      const orderDetails: OrderDetailResponse[] = result.orderDetails.map(
        (orderDetail) => {
          return {
            id: orderDetail.id,
            productVariantId: orderDetail.productVariantId,
            quantity: orderDetail.quantity,
            price: orderDetail.price,
            discountId: orderDetail.discountId,
          };
        },
      );

      const payment: PaymentResponse = {
        ...result.payment,
        paymentDate: result.payment.paymentDate
          ? result.payment.paymentDate.toISOString()
          : null,
      };

      const response: OrderResponse = {
        id: result.id,
        userId: result.userId,
        receiverName: result.receiverName,
        receiverPhoneNumber: result.receiverPhoneNumber,
        receiverAddress: result.receiverAddress,
        note: result.note,
        createAt: result.createAt.toISOString(),
        status: result.status,
        orderDetails: orderDetails,
        payment: payment,
        voucherId: result.voucherId,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }

  async isOrderReadyForReview(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        orderDetails: {
          select: {
            id: true,
            productVariantId: true,
          },
        },
      },
    });

    if (order.status !== OrderStatus.SUCCESS) {
      throw new RpcException(
        new BadRequestException('Unable to create feedback.'),
      );
    }

    const response = order.orderDetails.map((item) => ({
      id: item.id,
      productVariantId: item.productVariantId,
    }));
    return response;
  }

  async getOrderSummary(productVariantIds: number[]) {
    const numberOfPurchasesResult = await this.prisma.orderDetail.aggregate({
      where: {
        productVariantId: {
          in: productVariantIds,
        },
        order: {
          status: OrderStatus.SUCCESS,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    return {
      numberOfPurchases: numberOfPurchasesResult._sum.quantity ?? 0,
    };
  }

  async updateVNpayPayment(orderId: number, transactionId: string) {
    try {
      await this.prisma.payment.update({
        where: { orderId: orderId },
        data: {
          status: PaymentStatus.SUCCESS,
          paymentDate: new Date(),
          transactionId: transactionId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getOrdersByUserId(userId: number): Promise<OrderResponse[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId: userId },
        select: {
          id: true,
        },
      });

      const promises = orders.map((order) => this.getOrderDetailById(order.id));
      let response = await Promise.all(promises);
      response = response.sort(
        (a, b) =>
          new Date(b.createAt).getTime() - new Date(a.createAt).getTime(),
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getOrderStatistic() {
    // Đếm số lượng đơn hàng theo từng status
    const groupedResult = await this.prisma.order.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    // Đếm tổng số đơn hàng
    const totalOrders = await this.prisma.order.count();

    const orderDetails = await this.prisma.orderDetail.findMany({
      where: {
        order: {
          status: OrderStatus.SUCCESS,
        },
      },
      select: {
        price: true,
        quantity: true,
      },
    });

    const totalRevenue = orderDetails.reduce(
      (prev, curr) => prev + curr.price * curr.quantity,
      0,
    );

    // Chuyển đổi kết quả thành một object dễ đọc hơn
    const orderCounts = {
      TOTAL_REVENUE: totalRevenue,
      TOTAL: totalOrders,
      [OrderStatus.PENDING]: 0,
      [OrderStatus.SHIPPING]: 0,
      [OrderStatus.SUCCESS]: 0,
      [OrderStatus.CANCEL]: 0,
    };

    groupedResult.forEach((item) => {
      orderCounts[item.status as OrderStatus] = item._count._all;
    });

    return orderCounts;
  }

  async getRevenueByProductVariantIds(productVariantIds: number[]) {
    const orderDetails = await this.prisma.orderDetail.findMany({
      where: {
        productVariantId: {
          in: productVariantIds,
        },
        order: {
          status: OrderStatus.SUCCESS,
        },
      },
      select: {
        quantity: true,
        price: true,
      },
    });

    const totalRevenue = orderDetails.reduce(
      (prev, curr) => {
        prev.totalSold = prev.totalSold + curr.quantity;
        prev.totalRevenue = prev.totalRevenue + curr.price * curr.quantity;
        return prev;
      },
      { totalSold: 0, totalRevenue: 0 },
    );

    return totalRevenue;
  }
}
