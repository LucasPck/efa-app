import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { MyModule } from './my/my.module';


@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TeamModule,
    MyModule,
    TournamentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
