import { BadRequestException, ConflictException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament-dto';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {
  }

  async getTournaments() {
    return this.prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        mode: true,
        stage: false,
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
        teams: true,
        mode: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${tournamentId} not found`);
    }

    return tournament;
  }

  async registerTournament(createTournamentDto: CreateTournamentDto) {
    const { name, mode, number, team, stage } = createTournamentDto;

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
        stage: stage || 'NOT_STARTED'
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
        number: true
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

    // Organiser les matchs
    const teams = tournament.teams.map(t => t.teamId);
    const matches = this.organizeMatches(teams);

    // Sauvegarder les matchs dans la base de données
    await this.saveMatches(tournamentId, matches, stage);

    // Mettre à jour le statut du tournoi
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
    // Assurez-vous d'avoir un modèle Match dans votre schéma Prisma
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
}