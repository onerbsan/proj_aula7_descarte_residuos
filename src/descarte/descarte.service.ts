import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PontoDescarte, PontoDescarteDocument } from './schemas/ponto-descarte.schema';
import { RegistroDescarte, RegistroDescarteDocument } from './schemas/registro-descarte.schema';
import { CreatePontoDescarteDto } from './dto/create-ponto-descarte.dto';
import { CreateRegistroDescarteDto } from './dto/create-registro-descarte.dto';

@Injectable()
export class DescarteService {
  constructor(
    @InjectModel(PontoDescarte.name) private pontoDescarteModel: Model<PontoDescarteDocument>,
    @InjectModel(RegistroDescarte.name) private registroDescarteModel: Model<RegistroDescarteDocument>,
  ) {}

  // --- CRUD PontoDescarte ---

  async createPontoDescarte(createPontoDescarteDto: CreatePontoDescarteDto): Promise<PontoDescarte> {
    const createdPonto = new this.pontoDescarteModel(createPontoDescarteDto);
    return createdPonto.save();
  }

  async findAllPontosDescarte(): Promise<PontoDescarte[]> {
    return this.pontoDescarteModel.find().exec();
  }

  async findPontoDescarteById(id: string): Promise<PontoDescarte> {
    const ponto = await this.pontoDescarteModel.findById(id).exec();
    if (!ponto) {
      throw new NotFoundException(`Ponto de Descarte com ID "${id}" não encontrado.`);
    }
    return ponto;
  }

  async updatePontoDescarte(id: string, updatePontoDescarteDto: CreatePontoDescarteDto): Promise<PontoDescarte> {
    const existingPonto = await this.pontoDescarteModel
      .findByIdAndUpdate(id, updatePontoDescarteDto, { new: true })
      .exec();

    if (!existingPonto) {
      throw new NotFoundException(`Ponto de Descarte com ID "${id}" não encontrado.`);
    }
    return existingPonto;
  }

  async deletePontoDescarte(id: string): Promise<any> {
    const result = await this.pontoDescarteModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Ponto de Descarte com ID "${id}" não encontrado.`);
    }
    return { message: 'Ponto de Descarte excluído com sucesso.' };
  }

  // --- CRUD RegistroDescarte ---

  async createRegistroDescarte(createRegistroDescarteDto: CreateRegistroDescarteDto): Promise<RegistroDescarte> {
    const ponto = await this.findPontoDescarteById(createRegistroDescarteDto.pontoDescarteId);
    const createdRegistro = new this.registroDescarteModel({
      ...createRegistroDescarteDto,
      pontoDescarte: ponto._id,
    });
    return createdRegistro.save();
  }

  async findAllRegistrosDescarte(query: any): Promise<RegistroDescarte[]> {
    // Implementar filtros: pontoDescarte, tipoResiduo, data, nomeUsuario
    const filter: any = {};
    if (query.pontoDescarte) filter.pontoDescarte = query.pontoDescarte;
    if (query.tipoResiduo) filter.tipoResiduo = query.tipoResiduo;
    if (query.nomeUsuario) filter.nomeUsuario = query.nomeUsuario;
    if (query.data) {
      // Implementação básica de filtro por data (pode ser aprimorada)
      const startOfDay = new Date(query.data);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(query.data);
      endOfDay.setHours(23, 59, 59, 999);
      filter.data = { $gte: startOfDay, $lte: endOfDay };
    }

    return this.registroDescarteModel.find(filter).populate('pontoDescarte').exec();
  }

  async findRegistroDescarteById(id: string): Promise<RegistroDescarte> {
    const registro = await this.registroDescarteModel.findById(id).populate('pontoDescarte').exec();
    if (!registro) {
      throw new NotFoundException(`Registro de Descarte com ID "${id}" não encontrado.`);
    }
    return registro;
  }

  // --- Dashboard / Relatório ---

  async getDashboardReport(): Promise<any> {
    const totalPontos = await this.pontoDescarteModel.countDocuments().exec();
    const totalRegistros = await this.registroDescarteModel.countDocuments().exec();

    // 1. Local de descarte com maior número de registros
    const localMaisRegistrado = await this.registroDescarteModel.aggregate([
      { $group: { _id: '$pontoDescarte', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'pontodescartes', localField: '_id', foreignField: '_id', as: 'ponto' } },
      { $unwind: '$ponto' },
      { $project: { _id: 0, nome: '$ponto.nome', count: 1 } },
    ]).exec();

    // 2. Tipo de resíduo mais frequentemente descartado
    const residuoMaisFrequente = await this.registroDescarteModel.aggregate([
      { $group: { _id: '$tipoResiduo', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, tipo: '$_id', count: 1 } },
    ]).exec();

    // 3. Média de descartes por dia no período dos últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const registrosUltimos30Dias = await this.registroDescarteModel.countDocuments({
      data: { $gte: trintaDiasAtras },
    }).exec();

    const mediaDescartesPorDia = registrosUltimos30Dias / 30;

    // 4. Número total de usuários no sistema (Simulando usuários únicos por nome)
    const totalUsuarios = await this.registroDescarteModel.distinct('nomeUsuario').countDocuments().exec();

    // 5. Total de pontos de descarte cadastrados (Já calculado como totalPontos)

    // 6. Percentual de crescimento ou redução no volume total de descartes comparado ao mês anterior
    const sessentaDiasAtras = new Date();
    sessentaDiasAtras.setDate(sessentaDiasAtras.getDate() - 60);

    const registrosMesAnterior = await this.registroDescarteModel.countDocuments({
      data: { $gte: sessentaDiasAtras, $lt: trintaDiasAtras },
    }).exec();

    let percentualCrescimento = 0;
    if (registrosMesAnterior > 0) {
      percentualCrescimento = ((registrosUltimos30Dias - registrosMesAnterior) / registrosMesAnterior) * 100;
    } else if (registrosUltimos30Dias > 0) {
      percentualCrescimento = 100; // Crescimento infinito se o mês anterior for zero
    }

    return {
      localMaisRegistrado: localMaisRegistrado[0] || { nome: 'N/A', count: 0 },
      residuoMaisFrequente: residuoMaisFrequente[0] || { tipo: 'N/A', count: 0 },
      mediaDescartesPorDia: parseFloat(mediaDescartesPorDia.toFixed(2)),
      totalUsuarios: totalUsuarios,
      totalPontos: totalPontos,
      percentualCrescimento: parseFloat(percentualCrescimento.toFixed(2)),
      totalRegistrosUltimos30Dias: registrosUltimos30Dias,
      totalRegistrosMesAnterior: registrosMesAnterior,
    };
  }
}
