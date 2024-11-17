import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import LoginDto from './dto/login.dto';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { AccountStatus } from 'src/constrants/enum/account-status.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import AuthResponseDto from './dto/auth-response.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdatePasswordByPhoneNumberDto } from './dto/update-password-by-phone-number.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(data: LoginDto) {
    // find account by phone number
    const account = await this.prisma.account.findUnique({
      where: {
        userPhoneNumber: data.phoneNumber,
      },
      include: {
        user: true,
        userRole: true,
      },
    });

    // throw exception if account not found
    if (!account) {
      throw new RpcException(
        new UnauthorizedException('Phone number not found.'),
      );
    }

    // compare password
    const pwMatches = await argon.verify(account.password, data.password);

    // throw exception if password incorrect
    if (!pwMatches) {
      throw new RpcException(new UnauthorizedException('Password incorrect.'));
    }

    const response: AuthResponseDto = {
      id: account.user.id,
      name: account.user.firstName + ' ' + account.user.lastName,
      email: account.user.email,
      image: account.user.image,
      role: account.userRole.name,
      status: account.status,
    };

    return response;
  }

  async register(data: RegisterDto) {
    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // generate the hashed password
        const hashedPassword = await argon.hash(data.password);

        // get user role with role name equal user
        const userRole = await prisma.role.findFirst({
          where: { name: UserRole.USER },
        });

        // save user
        await prisma.user.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            dateOfBirth: new Date(data.dateOfBirth),
            email: data.email,
            phoneNumber: data.phoneNumber,
            gender: data.gender,
          },
        });

        // save account
        await prisma.account.create({
          data: {
            userPhoneNumber: data.phoneNumber,
            password: hashedPassword,
            status: AccountStatus.ACTIVE,
            roleId: userRole.id,
          },
        });

        return { status: 201, message: 'Đăng ký tài khoản thành công' };
      });
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new RpcException(
            new ConflictException('Số điện thoại hoặc email đã tồn tại'),
          );
        }
      } else {
        throw new RpcException(error);
      }
    }
  }

  async updatePassword(userId: number, requestBody: UpdatePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          account: true,
        },
      });

      // check old password
      const isOldPasswordMatched = await argon.verify(
        user.account.password,
        requestBody.oldPassword,
      );

      if (!isOldPasswordMatched) {
        throw new RpcException(
          new BadRequestException('Mật khẩu cũ không đúng.'),
        );
      }

      // generate the hashed password
      const hashedPassword = await argon.hash(requestBody.newPassword);

      await this.prisma.account.update({
        where: {
          id: user.account.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return { status: 200, message: 'Update password successful.' };
    } catch (error) {
      throw error;
    }
  }

  async updatePasswordByPhoneNumber(
    requestBody: UpdatePasswordByPhoneNumberDto,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { phoneNumber: requestBody.phoneNumber },
        select: {
          account: true,
        },
      });

      if (!user) {
        throw new RpcException(new NotFoundException('User not found'));
      }

      // generate the hashed password
      const hashedPassword = await argon.hash(requestBody.newPassword);

      await this.prisma.account.update({
        where: {
          id: user.account.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return { status: 200, message: 'Update password successful.' };
    } catch (error) {
      throw error;
    }
  }
}
