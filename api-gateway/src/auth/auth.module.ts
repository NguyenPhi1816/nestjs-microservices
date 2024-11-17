import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategy/access-token.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    {
      provide: 'USER_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('USER_SERVICE_HOST'),
            port: configService.get('USER_SERVICE_PORT'),
          },
        });
      },
    },
    AuthService,
    AccessTokenStrategy,
  ],
})
export class AuthModule {}
