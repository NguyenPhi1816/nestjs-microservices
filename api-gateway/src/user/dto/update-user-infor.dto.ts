export class UpdateUserInforDto {
  email: string;
  address: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  image: Express.Multer.File;
  imageUrl: string | null;
  imageId: string | null;
}
