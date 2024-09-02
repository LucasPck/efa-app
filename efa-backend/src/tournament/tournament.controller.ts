import { Controller, Get, Param, Post, Body, Put } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament-dto';
import { TournamentService } from './tournament.service';

@Controller('tournament')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Get('settings')
  getTournaments() {
    return this.tournamentService.getTournaments();
  }

  @Get(':tournamentId')
  getTournament(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournament({ tournamentId });
  }

  @Post('createTournament')
  async registerTournament(@Body() createTournamentDto: CreateTournamentDto) {
    return await this.tournamentService.registerTournament(createTournamentDto);
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

  @Put(':tournamentId/match/:matchId')
  async updateMatchResult(
    @Param('tournamentId') tournamentId: string,
    @Param('matchId') matchId: string,
    @Body('winnerId') winnerId: string
  ) {
    return this.tournamentService.updateMatchResult(tournamentId, matchId, winnerId);
  }
}