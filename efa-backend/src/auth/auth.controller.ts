import { Body, Controller, Get, Post, UseGuards, Request, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestWithUser } from './jwt.strategy';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';

export type AuthBody = {
  email:      string;
  password:   string
};
export type CreateUser = {
  email:      string;
  nametag:    string;
  password:   string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  //localhost:3000/auth/login
  @Post('login')
  async login(@Body() authBody: AuthBody) {
    return await this.authService.login({
      authBody,
    });
  };

  //localhost:3000/auth/register
  @Post('register')
  async register(@Body() registerBody: CreateUserDto) {
    return await this.authService.register({
      registerBody,
    });
  };

  @Get()
  @UseGuards(JwtAuthGuard)
  async authenticateUser(@Request() request: RequestWithUser) {
    return await this.userService.getUser({
      userId: request.user.userId,
    });
  }
}