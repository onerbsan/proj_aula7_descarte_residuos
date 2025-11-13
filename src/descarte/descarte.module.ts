import { Module } from '@nestjs/common';
import { DescarteController } from './descarte.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PontoDescarte, PontoDescarteSchema } from './schemas/ponto-descarte.schema';
import { RegistroDescarte, RegistroDescarteSchema } from './schemas/registro-descarte.schema';
import { DescarteService } from './descarte.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PontoDescarte.name, schema: PontoDescarteSchema },
      { name: RegistroDescarte.name, schema: RegistroDescarteSchema },
    ]),
  ],
  controllers: [DescarteController],
  providers: [DescarteService]
})
export class DescarteModule {}
