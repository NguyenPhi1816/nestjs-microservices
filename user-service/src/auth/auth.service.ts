import {
  ConflictException,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(data: LoginDto) {
    // find account by phone number
    const account = await this.prisma.account.findUnique({
      where: {
        userPhoneNumber: data.phoneNumber,
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

    return {
      id: account.id,
      phoneNumber: account.userPhoneNumber,
      roleId: account.roleId,
    };
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
}
