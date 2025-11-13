import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateRegistroDescarteDto {
  @IsString()
  @IsNotEmpty()
  nomeUsuario: string;

  @IsMongoId()
  @IsNotEmpty()
  pontoDescarteId: string;

  @IsString()
  @IsNotEmpty()
  tipoResiduo: string; // Ex: plástico, papel, orgânico, eletrônico, vidro
}
