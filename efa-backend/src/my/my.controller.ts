import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TournamentService } from '../tournament/tournament.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestWithUser } from '../auth/jwt.strategy';
import { TeamService } from '../team/team.service';

@Controller('my')
export class MyController {
  constructor(private readonly tournamentService: TournamentService, private readonly teamService: TeamService) {
  }
  @UseGuards(JwtAuthGuard)
  @Get('user-tournaments')
  async getUserTournaments(@Request() req: RequestWithUser) {
    return this.tournamentService.getUserTournaments(req.user.userId);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserTeams(@Request() req) {
    const userId = req.user.userId;
    return this.teamService.getUserTeams(userId);
  }
}