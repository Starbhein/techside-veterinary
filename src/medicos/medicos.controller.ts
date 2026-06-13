import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { CreateMedicoHorarioDto } from './dto/create-medico-horario.dto';
import { UpdateMedicoHorarioDto } from './dto/update-medico-horario.dto';
import { CreateMedicoAsistenciaDto } from './dto/create-medico-asistencia.dto';
import { DisponibilidadDiasQueryDto } from './dto/disponibilidad-dias-query.dto';
import { DisponibilidadSlotsQueryDto } from './dto/disponibilidad-slots-query.dto';
import { FilterMedicosQueryDto } from './dto/filter-medicos-query.dto';
import {
  medicoResponseSchema,
  medicosListSchema,
  medicoHorarioResponseSchema,
  medicoHorariosListSchema,
  medicoAsistenciaResponseSchema,
  medicoAsistenciasListSchema,
} from '../common/swagger/medicos.schema';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '../common/swagger/error-responses';

@ApiTags('Médicos')
@Controller('api/v1/medicos')
@UseGuards(JwtAuthGuard)
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  // Médicos
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un nuevo médico' })
  @ApiBearerAuth('access-token')
  @ApiBody({
    description: 'Datos para crear un médico',
    schema: {
      type: 'object',
      properties: {
        usuarioId: {
          type: 'string',
          format: 'uuid',
          description: 'Usuario asociado al médico',
        },
        sucursalId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          description: 'Sucursal asignada',
        },
        especialidadPrincipalId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          description: 'Especialidad principal',
        },
        cedulaProfesional: {
          type: 'string',
          maxLength: 50,
          nullable: true,
        },
        biografiaCorta: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
      },
      required: ['usuarioId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Médico creado',
    schema: medicoResponseSchema,
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@Body(new ZodValidationPipe(CreateMedicoDto)) dto: CreateMedicoDto) {
    return this.medicosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar médicos con filtros opcionales' })
  @ApiBearerAuth('access-token')
  @ApiQuery({
    name: 'especialidadId',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filtrar por ID de especialidad',
  })
  @ApiQuery({
    name: 'sucursalId',
    type: 'string',
    format: 'uuid',
    required: false,
    description: 'Filtrar por ID de sucursal',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de médicos',
    schema: medicosListSchema,
  })
  @ApiUnauthorizedResponse()
  findAll(
    @Query(new ZodValidationPipe(FilterMedicosQueryDto))
    query: FilterMedicosQueryDto,
  ) {
    return this.medicosService.findFiltered(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener médico por ID' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiResponse({
    status: 200,
    description: 'Médico encontrado',
    schema: medicoResponseSchema,
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar datos de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiBody({
    description: 'Campos a actualizar (al menos uno)',
    schema: {
      type: 'object',
      properties: {
        sucursalId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          description: 'Sucursal asignada',
        },
        especialidadPrincipalId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
          description: 'Especialidad principal',
        },
        cedulaProfesional: {
          type: 'string',
          maxLength: 50,
          nullable: true,
        },
        biografiaCorta: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Médico actualizado',
    schema: medicoResponseSchema,
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateMedicoDto)) dto: UpdateMedicoDto,
  ) {
    return this.medicosService.update(id, dto);
  }

  // Horarios
  @Post(':id/horarios')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Crear un horario para un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiBody({
    description: 'Datos del horario',
    schema: {
      type: 'object',
      properties: {
        diaSemana: {
          type: 'string',
          enum: [
            'domingo',
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes',
            'sabado',
          ],
          description: 'Día de la semana',
        },
        horaInicio: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          description: 'Formato HH:MM',
        },
        horaFin: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          description: 'Formato HH:MM',
        },
        consultorioId: {
          type: 'string',
          format: 'uuid',
          description: 'Consultorio asignado',
        },
      },
      required: ['diaSemana', 'horaInicio', 'horaFin', 'consultorioId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Horario creado',
    schema: medicoHorarioResponseSchema,
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  crearHorario(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateMedicoHorarioDto))
    dto: CreateMedicoHorarioDto,
  ) {
    return this.medicosService.crearHorario(id, dto);
  }

  @Get(':id/horarios')
  @ApiOperation({ summary: 'Listar horarios de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de horarios',
    schema: medicoHorariosListSchema,
  })
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  listarHorarios(@Param('id') id: string) {
    return this.medicosService.listarHorarios(id);
  }

  @Patch(':id/horarios/:horarioId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar un horario de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiParam({
    name: 'horarioId',
    type: 'string',
    format: 'uuid',
    description: 'UUID del horario',
  })
  @ApiBody({
    description: 'Campos a actualizar (al menos uno)',
    schema: {
      type: 'object',
      properties: {
        diaSemana: {
          type: 'string',
          enum: [
            'domingo',
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes',
            'sabado',
          ],
          nullable: true,
          description: 'Día de la semana',
        },
        horaInicio: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          nullable: true,
          description: 'Formato HH:MM',
        },
        horaFin: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          nullable: true,
          description: 'Formato HH:MM',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Horario actualizado',
    schema: medicoHorarioResponseSchema,
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  actualizarHorario(
    @Param('id') id: string,
    @Param('horarioId') horarioId: string,
    @Body(new ZodValidationPipe(UpdateMedicoHorarioDto))
    dto: UpdateMedicoHorarioDto,
  ) {
    return this.medicosService.actualizarHorario(id, horarioId, dto);
  }

  @Delete(':id/horarios/:horarioId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Eliminar un horario de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiParam({
    name: 'horarioId',
    type: 'string',
    format: 'uuid',
    description: 'UUID del horario',
  })
  @ApiResponse({ status: 200, description: 'Horario eliminado' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  eliminarHorario(
    @Param('id') id: string,
    @Param('horarioId') horarioId: string,
  ) {
    return this.medicosService.eliminarHorario(id, horarioId);
  }

  // Asistencias
  @Post(':id/asistencias')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Registrar asistencia manual de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiBody({
    description: 'Datos de la asistencia',
    schema: {
      type: 'object',
      properties: {
        fecha: {
          type: 'string',
          format: 'date',
          description: 'Formato YYYY-MM-DD',
        },
        horaEntradaReal: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          nullable: true,
          description: 'Formato HH:MM',
        },
        horaSalidaReal: {
          type: 'string',
          pattern: '^([01]\\d|2[0-3]):[0-5]\\d$',
          nullable: true,
          description: 'Formato HH:MM',
        },
        estado: {
          type: 'string',
          enum: [
            'asistencia',
            'falta',
            'retardo',
            'justificado',
            'incapacidad',
          ],
          description: 'Estado de asistencia',
        },
        observaciones: {
          type: 'string',
          maxLength: 1000,
          nullable: true,
        },
      },
      required: ['fecha', 'estado'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Asistencia registrada',
    schema: medicoAsistenciaResponseSchema,
  })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  registrarAsistencia(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CreateMedicoAsistenciaDto))
    dto: CreateMedicoAsistenciaDto,
  ) {
    return this.medicosService.registrarAsistenciaManual(id, dto);
  }

  @Get(':id/asistencias')
  @ApiOperation({ summary: 'Listar asistencias de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiQuery({
    name: 'desde',
    type: 'string',
    format: 'date',
    required: false,
    description: 'Fecha inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    type: 'string',
    format: 'date',
    required: false,
    description: 'Fecha final (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de asistencias',
    schema: medicoAsistenciasListSchema,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  listarAsistencias(
    @Param('id') id: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.medicosService.listarAsistencias(id, desde, hasta);
  }

  @Get(':id/disponibilidad-dias')
  @ApiOperation({ summary: 'Obtener días disponibles de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiQuery({
    name: 'desde',
    type: 'string',
    format: 'date',
    required: true,
    description: 'Fecha inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'hasta',
    type: 'string',
    format: 'date',
    required: true,
    description: 'Fecha final (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Días disponibles' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  disponibilidadDias(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(DisponibilidadDiasQueryDto))
    query: DisponibilidadDiasQueryDto,
  ) {
    return this.medicosService.disponibilidadDias(id, query.desde, query.hasta);
  }

  @Get(':id/disponibilidad-slots')
  @ApiOperation({
    summary: 'Obtener slots disponibles de un médico para una fecha',
  })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiQuery({
    name: 'fecha',
    type: 'string',
    format: 'date',
    required: true,
    description: 'Fecha a consultar (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, description: 'Slots disponibles' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse()
  disponibilidadSlots(
    @Param('id') id: string,
    @Query(new ZodValidationPipe(DisponibilidadSlotsQueryDto))
    query: DisponibilidadSlotsQueryDto,
  ) {
    return this.medicosService.disponibilidadSlots(id, query.fecha);
  }

  @Post(':id/asistencias/salida')
  @UseGuards(RolesGuard)
  @Roles('medico', 'admin')
  @ApiOperation({ summary: 'Marcar salida de un médico' })
  @ApiBearerAuth('access-token')
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID del médico',
  })
  @ApiResponse({ status: 200, description: 'Salida registrada' })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  marcarSalida(@Param('id') id: string) {
    return this.medicosService.marcarSalida(id);
  }
}
