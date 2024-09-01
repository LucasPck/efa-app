import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament-dto';
import { TournamentService } from './tournament.service';

export type CreateTournament = {
  name:      string;
  mode:      string;
  number:    string;
  team:      string;
  stage?:     string;
};

@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {
  }

  //localhost:3000/tournaments/settings
  @Get('settings')
  getTournaments() {
    return this.tournamentService.getTournaments();
  }

  @Get('/:tournamentId')
  // localhost:3000/tournaments/3000
  getTournament(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournament({
      tournamentId,
    });
  }

  //localhost:3000/tournament/createTournament
  @Post('createTournament')
  async registerTournament(@Body() createTournamentDto: CreateTournamentDto) {
    return await this.tournamentService.registerTournament(
      createTournamentDto
    );
  }

  @Post(':tournamentId/addTeam')
  async addTeamToTournament(
    @Param('tournamentId') tournamentId: string,
    @Body('teamTag') teamTag: string
  ) {
    return this.tournamentService.addTeamToTournament(tournamentId, teamTag);
  }

  @Post(':tournamentId/start')
  async startTournament(
    @Param('tournamentId') tournamentId: string,
    @Body('mode') mode: string,
    @Body('number') number: string
  ) {
    return this.tournamentService.manageTournament(tournamentId, mode, number);
  }
}