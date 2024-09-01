import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy }  from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import * as process from 'node:process';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      }
    }),
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    UserService,
    PrismaService,
    JwtStrategy
  ],
  exports: [
    AuthService
  ],
})
export class AuthModule {}
