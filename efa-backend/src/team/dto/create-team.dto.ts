import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @IsNotEmpty()
  @IsString({ message: "Rentrer le nom de votre équipe"})
  @MinLength(2, { message: "Le nom de l'équipe doit faire au moins 2 caractère"})
  name: string;

  @IsNotEmpty()
  toplaner: string;

  @IsNotEmpty()
  jungler: string;

  @IsNotEmpty()
  midlaner: string;

  @IsNotEmpty()
  botlaner: string;

  @IsNotEmpty()
  support: string;
}
