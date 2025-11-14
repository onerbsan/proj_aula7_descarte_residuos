import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DescarteModule } from './descarte/descarte.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://onerB_san:onerB.san03@onerbs.zgeuulu.mongodb.net/proj_aula7?appName=onerBs'),
    DescarteModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
