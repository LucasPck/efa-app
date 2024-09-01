import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$extends({
      result: {
        user: {
          username: {
            needs: {nametag: true, id: true},
            compute(user) {
                return `${user.nametag}#${user.id.slice(0,5)}`
            },
          }
        }
      }
    }).$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}