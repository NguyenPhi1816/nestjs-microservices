import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { MessagePattern } from '@nestjs/microservices';
import { UpdateUserStatusReq } from './dto/update-user-status.dto';

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

  @MessagePattern({ cmd: 'update-user-status' })
  updateUserStatus(data: UpdateUserStatusReq) {
    return this.userService.updateUserStatus(data);
  }
}
