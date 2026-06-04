import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { MxDivisionesService } from './mx-divisiones.service';
import { MxDivision } from '@prisma/client';

@Controller('mx-divisiones')
export class MxDivisionesController {
  constructor(private readonly service: MxDivisionesService) {}

  @Get()
  async findAll(): Promise<MxDivision[]> {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<MxDivision> {
    return this.service.findById(id);
  }
}
