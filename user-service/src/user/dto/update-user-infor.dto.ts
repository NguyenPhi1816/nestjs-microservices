import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateUserInforRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsOptional()
  @IsUrl()
  image: string;

  @IsOptional()
  @IsString()
  imageId: string;
}
