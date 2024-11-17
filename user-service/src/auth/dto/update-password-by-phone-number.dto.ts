import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordByPhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
