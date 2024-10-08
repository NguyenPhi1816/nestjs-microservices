export default class TokenResponseDto {
  accessToken: string;
  expires: Date;
  user: {
    name: string;
    email: string;
    image: string;
    id: number;
  };
  provider: string;
  providerAccountId: number;
}
