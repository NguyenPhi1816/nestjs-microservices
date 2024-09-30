import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import ProfileResponse from './dto/profile-response.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        address: true,
        phoneNumber: true,
        gender: true,
        dateOfBirth: true,
        image: true,
        email: true,
        account: {
          select: {
            status: true,
            userRole: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new RpcException(
        new NotFoundException('Không tìm thấy người dùng'),
      );
    }

    const response: ProfileResponse = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth.toString(),
      image: user.image,
      email: user.email,
      status: user.account.status,
      role: user.account.userRole.name,
    };

    return response;
  }
}
