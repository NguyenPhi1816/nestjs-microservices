import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { AccountStatus } from 'src/constrants/enum/account-status.enum';
import { UserRole } from 'src/constrants/enum/user-role.enum';

export class UserResponseDto {
  @IsInt()
  id: number;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  address: string;
  @IsPhoneNumber('VN')
  phoneNumber: string;
  @IsString()
  gender: string;
  @IsDateString()
  dateOfBirth: Date;
  @IsUrl()
  image: string | null;
  @IsEmail()
  email: string;
  @IsEnum(AccountStatus)
  status: string;
  @IsEnum(UserRole)
  role: string;
}
