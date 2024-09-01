import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({},{ message: "Vous devez fournir une email valable." })
  email:string;

  @IsNotEmpty()
  @MinLength(7, { message: 'Votre mot de passe doit faire au minimum 7 lettres' })
  password: string;

  @IsString({ message: "Veuillez mettre votre pseudo" })
  @MinLength(3, { message: 'Votre pseudo doit faire au minimum 7 caractères' })
  @MaxLength(20, { message: 'Votre pseudo doit faire au maximum 20 caractères' })
  nametag: string;
}