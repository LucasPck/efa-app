import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthBody, CreateUser } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { hash } from 'bcrypt';
import { compare } from 'bcrypt';
import { UserPayload } from './jwt.strategy';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login({ authBody }: {authBody : AuthBody}){
    const {email, password } = authBody;
    console.log(email);
    // const hashPassword = await this.hashPassword({ password });
    const existingUser = await this.prisma.user.findUnique({
    where: {
      email,
    },
    });

    if (!existingUser) {
      throw new Error("Email inconnu aux bataillon");
    }

    const isPasswordValid = await this.isPasswordValid({
      password,
      hashedPassword: existingUser.password,
    });

    if (!isPasswordValid) {
      throw new Error("Pas le bon mot de passe soldat !");
    }
    return this.authenticateUser({
      userId: existingUser.id,
    });
  }

  async register({ registerBody }: {registerBody : CreateUser}){
    const {email, nametag, password } = registerBody;
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new Error("Tu as déjà un compte soldat !");
    }

    const hashedPassword = await this.hashPassword({ password });

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nametag,
      }
    })

    return this.authenticateUser({
      userId: createdUser.id,
    });
  }

  private async hashPassword({ password }: { password: string }) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  private async isPasswordValid({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }
  private authenticateUser({ userId }: UserPayload) {
    const payload: UserPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}

