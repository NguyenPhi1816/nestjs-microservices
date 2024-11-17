import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtModule } from '@nestjs/jwt';
import { OptionalAuthGuard } from 'src/auth/guard/optional-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ProductController],
  providers: [ProductService, OptionalAuthGuard],
})
export class ProductModule {}
