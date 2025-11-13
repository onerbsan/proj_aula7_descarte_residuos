import { IsString, IsNotEmpty, IsIn, IsArray, IsNumber } from 'class-validator';

export class CreatePontoDescarteDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  bairro: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['público', 'privado'])
  tipoLocal: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categoriasResiduos: string[];

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;
}
