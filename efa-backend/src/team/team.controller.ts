import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamService } from './team.service';

export type CreateTeam = {
  name:      string;
  toplaner:    string;
  jungler:   string;
  midlaner:    string;
  botlaner:   string;
  support:   string;
};

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {
  }
  //localhost:3000/team/settings
  @Get('settings')
  getTeams() {
    return this.teamService.getTeams();
  }

  @Get('/:teamId')
// localhost:3000/team/3000
  getTeam(@Param('teamId') teamId: string) {
    return this.teamService.getTeam({
      teamId,
    });
  }

  //localhost:3000/team/createTeam
  @Post('createTeam')
  async registerTeam(@Body() registerTeamBody: CreateTeamDto) {
    return await this.teamService.registerTeam({
      registerTeamBody,
    });
  };

  @Delete(':teamId')
  async deleteTeam(@Param('teamId') teamId: string) {
    return this.teamService.deleteTeam(teamId);
  }
}
