import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DescarteService } from './descarte.service';
import { CreatePontoDescarteDto } from './dto/create-ponto-descarte.dto';
import { CreateRegistroDescarteDto } from './dto/create-registro-descarte.dto';

@Controller('descarte')
export class DescarteController {
  constructor(private readonly descarteService: DescarteService) {}

  // --- Rotas para Pontos de Descarte ---

  @Post('pontos')
  createPonto(@Body() createPontoDescarteDto: CreatePontoDescarteDto) {
    return this.descarteService.createPontoDescarte(createPontoDescarteDto);
  }

  @Get('pontos')
  findAllPontos() {
    return this.descarteService.findAllPontosDescarte();
  }

  @Get('pontos/:id')
  findOnePonto(@Param('id') id: string) {
    return this.descarteService.findPontoDescarteById(id);
  }

  @Patch('pontos/:id')
  updatePonto(@Param('id') id: string, @Body() updatePontoDescarteDto: CreatePontoDescarteDto) {
    return this.descarteService.updatePontoDescarte(id, updatePontoDescarteDto);
  }

  @Delete('pontos/:id')
  removePonto(@Param('id') id: string) {
    return this.descarteService.deletePontoDescarte(id);
  }

  // --- Rotas para Registros de Descarte ---

  @Post('registros')
  createRegistro(@Body() createRegistroDescarteDto: CreateRegistroDescarteDto) {
    return this.descarteService.createRegistroDescarte(createRegistroDescarteDto);
  }

  @Get('registros')
  findAllRegistros(@Query() query: any) {
    return this.descarteService.findAllRegistrosDescarte(query);
  }

  @Get('registros/:id')
  findOneRegistro(@Param('id') id: string) {
    return this.descarteService.findRegistroDescarteById(id);
  }

  // --- Rota de Dashboard ---

  @Get('relatorio')
  getRelatorio() {
    return this.descarteService.getDashboardReport();
  }
}
