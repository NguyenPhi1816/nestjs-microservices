import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export default class LoginDto {
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
