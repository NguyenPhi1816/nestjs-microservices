export class UpdateUserInforRequestDto {
  email: string;
  address: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  image: string | null;
  imageId: string | null;
}
