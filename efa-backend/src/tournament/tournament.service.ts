import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament-dto';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  async getTournaments() {
    return this.prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        mode: true,
        stage: true,
      },
    });
  }

  async getTournament({ tournamentId }: { tournamentId: string }) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
      select: {
        id: true,
        teams: {
          select: {
            team: true
          }
        },
        mode: true,
        stage: true,
        matches: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    return tournament;
  }

  async registerTournament(createTournamentDto: CreateTournamentDto) {
    const { name, mode, number, team } = createTournamentDto;

    const [teamName, teamIdSuffix] = team.split('#');
    if (!teamName || !teamIdSuffix) {
      throw new BadRequestException("Format d'équipe invalide");
    }

    const existingTeam = await this.prisma.team.findFirst({
      where: {
        name: teamName,
        id: {
          endsWith: teamIdSuffix
        }
      }
    });

    if (!existingTeam) {
      throw new NotFoundException("Équipe non trouvée ou ID incorrect");
    }

    const createdTournament = await this.prisma.tournament.create({
      data: {
        name,
        mode,
        number,
        stage: 'NOT_STARTED'
      }
    });

    await this.prisma.teamsOnTournaments.create({
      data: {
        teamId: existingTeam.id,
        tournamentId: createdTournament.id
      }
    });

    return createdTournament;
  }

  async getUserTournaments(userId: string) {
    return this.prisma.tournament.findMany({
      where: {
        teams: {
          some: {
            team: {
              users: {
                some: {
                  userId: userId
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        mode: true,
        number: true,
        stage: true
      }
    });
  }

  async addTeamToTournament(tournamentId: string, teamTag: string) {
    const [teamName, teamIdSuffix] = teamTag.split('#');
    if (!teamName || !teamIdSuffix) {
      throw new BadRequestException("Format d'équipe invalide");
    }

    const existingTeam = await this.prisma.team.findFirst({
      where: {
        name: teamName,
        id: {
          endsWith: teamIdSuffix
        }
      }
    });

    if (!existingTeam) {
      throw new NotFoundException("Équipe non trouvée ou ID incorrect");
    }

    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: true
      }
    });

    if (!tournament) {
      throw new NotFoundException("Tournoi non trouvé");
    }

    if (tournament.teams.length >= parseInt(tournament.number)) {
      throw new ConflictException("Le nombre maximum d'équipes pour ce tournoi a été atteint");
    }

    const isTeamAlreadyRegistered = tournament.teams.some(t => t.teamId === existingTeam.id);
    if (isTeamAlreadyRegistered) {
      throw new ConflictException("Cette équipe est déjà inscrite à ce tournoi");
    }

    try {
      await this.prisma.teamsOnTournaments.create({
        data: {
          teamId: existingTeam.id,
          tournamentId: tournament.id
        }
      });

      return { message: "Équipe ajoutée au tournoi avec succès" };
    } catch (error) {
      throw new BadRequestException("Erreur lors de l'ajout de l'équipe au tournoi");
    }
  }

  async manageTournament(tournamentId: string, mode: string, number: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { teams: true }
    });

    if (!tournament) {
      throw new BadRequestException('Tournoi non trouvé');
    }

    let format: number;
    switch (number) {
      case '4':
        format = 4;
        break;
      case '8':
        format = 8;
        break;
      case '16':
        format = 16;
        break;
      default:
        throw new BadRequestException('Valeur de "number" invalide');
    }

    if (tournament.teams.length < format) {
      throw new BadRequestException('Pas assez de participants');
    } else if (tournament.teams.length > format) {
      throw new BadRequestException('Trop de participants');
    }

    let stage: string;
    switch (mode) {
      case 'BO1':
      case 'BO3':
      case 'BO5':
        stage = mode;
        break;
      default:
        throw new BadRequestException('Valeur de "mode" invalide');
    }

    const teams = tournament.teams.map(t => t.teamId);
    const matches = this.organizeMatches(teams);

    await this.saveMatches(tournamentId, matches, stage);

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { stage: 'IN_PROGRESS' }
    });

    return `Tournoi prêt à démarrer avec le format ${stage} et ${matches.length} matchs organisés.`;
  }

  private organizeMatches(teams: string[]): [string, string][] {
    const shuffled = teams.sort(() => 0.5 - Math.random());
    const matches: [string, string][] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      matches.push([shuffled[i], shuffled[i + 1]]);
    }
    return matches;
  }

  private async saveMatches(tournamentId: string, matches: [string, string][], stage: string) {
    for (const [team1, team2] of matches) {
      await this.prisma.match.create({
        data: {
          tournamentId,
          team1Id: team1,
          team2Id: team2,
          stage,
          status: 'PENDING'
        }
      });
    }
  }

  async updateMatchResult(tournamentId: string, matchId: string, winnerId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true }
    });

    if (!match || match.tournamentId !== tournamentId) {
      throw new NotFoundException("Match non trouvé");
    }

    if (match.status !== 'PENDING') {
      throw new ConflictException("Le résultat de ce match a déjà été enregistré");
    }

    if (winnerId !== match.team1Id && winnerId !== match.team2Id) {
      throw new BadRequestException("L'ID de l'équipe gagnante est invalide");
    }

    await this.prisma.match.update({
      where: { id: matchId },
      data: { winnerId, status: 'COMPLETED' }
    });

    await this.progressTournament(tournamentId);

    return { message: "Résultat du match mis à jour avec succès" };
  }

  private async progressTournament(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { matches: true }
    });

    if (!tournament) {
      throw new NotFoundException("Tournoi non trouvé");
    }

    const pendingMatches = tournament.matches.filter(match => match.status === 'PENDING');

    if (pendingMatches.length === 0) {
      const completedMatches = tournament.matches.filter(match => match.status === 'COMPLETED');
      const winners = completedMatches.map(match => match.winnerId);

      if (winners.length === 1) {
        await this.prisma.tournament.update({
          where: { id: tournamentId },
          data: { stage: 'FINISHED', winnerId: winners[0] }
        });
      } else {
        const nextMatches = this.organizeMatches(winners);
        await this.saveMatches(tournamentId, nextMatches, tournament.mode);
      }
    }
  }
}