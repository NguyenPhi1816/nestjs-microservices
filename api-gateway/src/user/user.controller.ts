import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  catchError,
  defaultIfEmpty,
  firstValueFrom,
  map,
  throwError,
} from 'rxjs';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { UpdateUserStatusReq } from './dto/update-user-status.dto';
import { UpdateUserInforDto } from './dto/update-user-infor.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import UploadResponse from 'src/product/dto/upload-response.dto';
import CreateCategoryRequestDto from 'src/category/dto/create-category-request.dto';
import { UpdateUserInforRequestDto } from './dto/update-user-infor-request.dto';

@Controller('api/users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private client: ClientProxy,
    @Inject('MEDIA_SERVICE') private mediaClient: ClientProxy,
  ) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAllUser() {
    return this.client
      .send({ cmd: 'get-all-user' }, {})
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@GetUser('id') userId: number) {
    return this.client
      .send({ cmd: 'get-profile' }, userId)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Put('/status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateUserStatus(@Body() data: UpdateUserStatusReq) {
    return this.client
      .send({ cmd: 'update-user-status' }, data)
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Put()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateUserInfo(
    @GetUser('id') userId: number,
    @Body() request: UpdateUserInforDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!!file) {
      // remove exist image from cloudinary
      if (!!request.imageId) {
        await firstValueFrom(
          this.mediaClient.send({ cmd: 'delete-image' }, request.imageId).pipe(
            defaultIfEmpty(null), // Trả về null nếu không có phần tử nào
          ),
        );
      }

      request.image = file;
      const fileBuffers = [request.image.buffer];
      console.log(fileBuffers);
      const uploadRes: UploadResponse[] = await firstValueFrom(
        this.mediaClient.send({ cmd: 'upload' }, fileBuffers).pipe(
          catchError((error) =>
            throwError(() => new RpcException(error.response)),
          ),
          map((response) => {
            return response as UploadResponse[];
          }),
        ),
      );

      if (uploadRes.length > 0) {
        request.imageUrl = uploadRes[0].path;
        request.imageId = uploadRes[0].id;
      }
    }

    const rq: UpdateUserInforRequestDto = {
      email: request.email,
      address: request.address,
      phoneNumber: request.phoneNumber,
      firstName: request.firstName,
      lastName: request.lastName,
      dateOfBirth: request.dateOfBirth,
      gender: request.gender,
      image: request.imageUrl,
      imageId: request.imageId,
    };

    return this.client
      .send({ cmd: 'update-user-infor' }, { userId, request: rq })
      .pipe(
        catchError((error) =>
          throwError(() => new RpcException(error.response)),
        ),
      );
  }

  @Post('seed-data')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  seedData() {
    return this.client.send({ cmd: 'seed-data' }, {});
  }

  @Get('get-top-categories')
  @UseGuards(AccessTokenGuard)
  getTopRecommendation(@GetUser('id') userId: number) {
    return this.client.send({ cmd: 'get-top-categories' }, userId);
  }
}
