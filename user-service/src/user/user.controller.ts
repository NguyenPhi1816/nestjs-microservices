import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { UpdateUserStatusReq } from './dto/update-user-status.dto';
import { UpdateUserInforRequestDto } from './dto/update-user-infor.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'get-all-user' })
  getAllUser() {
    return this.userService.getAllUsers();
  }

  @MessagePattern({ cmd: 'get-profile' })
  getProfile(userId: number): any {
    return this.userService.getProfile(userId);
  }

  @MessagePattern({ cmd: 'get-profile-by-phone-number' })
  getProfileByPhoneNumber(phoneNumber: string): any {
    return this.userService.getProfileByPhoneNumber(phoneNumber);
  }

  @MessagePattern({ cmd: 'update-user-status' })
  updateUserStatus(data: UpdateUserStatusReq) {
    return this.userService.updateUserStatus(data);
  }

  @MessagePattern({ cmd: 'update-user-infor' })
  updateUserInfor(data: {
    userId: number;
    request: UpdateUserInforRequestDto;
  }) {
    return this.userService.UpdateUserInfo(data.userId, data.request);
  }
}
