import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import ProfileResponse from './dto/profile-response.dto';
import { RpcException } from '@nestjs/microservices';
import { UserResponseDto } from './dto/user-response';
import { UpdateUserStatusReq } from './dto/update-user-status.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(): Promise<UserResponseDto[]> {
    try {
      const users = await this.prisma.user.findMany({
        include: {
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
      const response: UserResponseDto[] = users.map((user) => {
        const status = user.account.status;
        const role = user.account.userRole.name;
        delete user.account;
        return {
          ...user,
          status: status,
          role: role,
        };
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

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

  async updateUserStatus(data: UpdateUserStatusReq): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: data.userId,
        },
        data: {
          account: {
            update: {
              status: data.status,
            },
          },
        },
        include: {
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
      const role = user.account.userRole.name;
      const status = user.account.status;
      delete user.account;
      const response: UserResponseDto = {
        ...user,
        role,
        status,
      };
      return response;
    } catch (error) {
      throw error;
    }
  }
}
