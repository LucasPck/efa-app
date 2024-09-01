import { Module } from '@nestjs/common';
import { TournamentService } from '../tournament/tournament.service';
import { PrismaService } from '../prisma.service';
import { MyController } from './my.controller';
import { TeamService } from '../team/team.service';

@Module({
  controllers: [
    MyController
  ],
  providers: [
    TournamentService,
    TeamService,
    PrismaService
  ],
})
export class MyModule {}
