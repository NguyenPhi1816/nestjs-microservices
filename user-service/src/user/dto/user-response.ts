import { AccountStatus } from 'src/constrants/enum/account-status.enum';
import { UserRole } from 'src/constrants/enum/user-role.enum';

export class UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: Date;
  image: string | null;
  imageId: string | null;
  email: string;
  status: string;
  role: string;
}
