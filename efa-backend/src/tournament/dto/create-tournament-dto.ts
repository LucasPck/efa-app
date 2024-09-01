import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator';

export class CreateTournamentDto {
  @IsString({ message: "Entrez le nom du tournoi" })
  @MinLength(2, { message: "Le nom du tournoi doit faire au moins 2 caractères" })
  name: string;

  @IsNotEmpty()
  @IsString({ message: "Entrez le mode du tournoi" })
  mode: string;

  @IsNotEmpty()
  @IsString({ message: "Entrez le nombre de participants" })
  number: string;

  @IsNotEmpty()
  @IsString({ message: "Entrez l'équipe au format nom_équipe#XXXXX" })
  @Matches(/^.+#[A-Za-z0-9]{5}$/, { message: "Le format de l'équipe doit être nom_équipe#XXXXX" })
  team: string;

  @IsString()
  stage: string;
}