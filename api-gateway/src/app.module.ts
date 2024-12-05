import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { MailModule } from './mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { PromotionModule } from './promotion/promotion.module';
import { VoucherModule } from './voucher/voucher.module';
import { DiscountModule } from './discount/discount.module';
import { NotificationModule } from './notification/notification.module';
import { BlogModule } from './blog/blog.module';

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
    MailModule,
    PromotionModule,
    VoucherModule,
    DiscountModule,
    NotificationModule,
    BlogModule,
  ],
})
export class AppModule {}
