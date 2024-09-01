import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTeam } from './team.controller';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeams() {
    return this.prisma.team.findMany({
      select: {
        id: true,
        name: true
      },
    });
  }

  async getTeam({ teamId }: { teamId: string }) {
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        tournaments: true,
        users: {
          include: {
            user: true
          }
        }
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return team;
  }

  async registerTeam({ registerTeamBody }: {registerTeamBody : CreateTeam}) {
    const { name, toplaner, jungler, midlaner, botlaner, support } = registerTeamBody;
    const players = {
      toplaner,
      jungler,
      midlaner,
      botlaner,
      support
    };
    type Lane = 'toplaner' | 'midlaner' | 'jungler' | 'botlaner' | 'support'

    type ParsedPlayers = Record<Lane, { nametag: string; id: string; isValid: boolean; fullId:string }>

    const parsedPlayers = await Promise.all(
      Object.entries(players)
        .map(async ([key, value]) => {
          const [nametag, id] = value.split('#')
          const userExists = await this.prisma.user.findFirst({ where: { nametag } });
          const isValid = userExists.id.slice(-5) === id;

          return { key, nametag, id, isValid, fullId:userExists.id };

        })
    )

    const verifiedPlayers = parsedPlayers.reduce<ParsedPlayers>((acc, player) => {
      acc[player.key] = { nametag: player.nametag, id: player.id, isValid: player.isValid, fullId: player.fullId }

      return acc;
    }, {} as ParsedPlayers);

    if (parsedPlayers.some( (player) => !player.isValid)) {
      throw new Error("Un joueur n'est pas valide")
    }

    const existingTeam = await this.prisma.team.findFirst({
      where: {
        name
      }, include: {
        users: true
      }
    });

    if (existingTeam) {
      const validTeamPlayers = existingTeam.users.map( (user) => verifiedPlayers[user.lane].fullId === user.userId )

      if (validTeamPlayers.filter( Boolean ).length === existingTeam.users.length) {
        throw new Error("l'équipe existe déjà");
      }
    }

    const createdteam = await this.prisma.team.create({
      data: {
        name,
        users: {
          createMany: {
            data: Object.entries(verifiedPlayers).map(([lane, player]) => ({
              userId: player.fullId,
              lane: lane,
            }))
          }
        }
      }, include: {
        users: true
      }
    })

    return createdteam;
  }

  async deleteTeam(teamId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: { users: true }
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // Supprimer d'abord les relations avec les utilisateurs
    await this.prisma.usersOnTeams.deleteMany({
      where: { teamId: team.id }
    });

    // Ensuite, supprimer l'équipe elle-même
    await this.prisma.team.delete({
      where: { id: team.id }
    });

    return { message: 'Team deleted successfully' };
  }

  async getUserTeams(userId: string) {
    return this.prisma.team.findMany({
      where: {
        users: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                nametag: true
              }
            }
          }
        }
      }
    });
  }
}
