import { Module } from '@nestjs/common';
import { HistorialMedicoController } from './historial-medico.controller';
import { HistorialMedicoService } from './historial-medico.service';

@Module({
  controllers: [HistorialMedicoController],
  providers: [HistorialMedicoService],
})
export class HistorialMedicoModule {}
