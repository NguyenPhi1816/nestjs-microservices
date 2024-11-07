import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { MediaModule } from './media/media.module';
import { CategoryModule } from './category/category.module';
import { BrandModule } from './brand/brand.module';
import { OrderModule } from './order/order.module';
import { PredictModule } from './predict/predict.module';
import { ReviewModule } from './review/review.module';
import { CartModule } from './cart/cart.module';
import { VnpayModule } from './vnpay/vnpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    ProductModule,
    MediaModule,
    CategoryModule,
    BrandModule,
    OrderModule,
    PredictModule,
    ReviewModule,
    CartModule,
    VnpayModule,
  ],
})
export class AppModule {}
