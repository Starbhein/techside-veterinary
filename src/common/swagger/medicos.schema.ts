export const medicoResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    cedulaProfesional: { type: 'string', nullable: true },
    biografiaCorta: { type: 'string', nullable: true },
    usuario: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombreCompleto: { type: 'string' },
        email: { type: 'string', format: 'email' },
      },
    },
    sucursal: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombre: { type: 'string' },
      },
    },
    especialidadPrincipal: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombre: { type: 'string' },
      },
    },
  },
};

export const medicosListSchema = {
  type: 'array',
  items: medicoResponseSchema,
};

export const medicoHorarioResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
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
    },
    horaInicio: { type: 'string', format: 'time' },
    horaFin: { type: 'string', format: 'time' },
    consultorio: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombre: { type: 'string' },
        numero: { type: 'string', nullable: true },
      },
    },
    medico: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombreCompleto: { type: 'string' },
      },
    },
  },
};

export const medicoHorariosListSchema = {
  type: 'array',
  items: medicoHorarioResponseSchema,
};

export const medicoAsistenciaResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fecha: { type: 'string', format: 'date' },
    horaEntradaReal: { type: 'string', format: 'time', nullable: true },
    horaSalidaReal: { type: 'string', format: 'time', nullable: true },
    estado: {
      type: 'string',
      enum: ['asistencia', 'falta', 'retardo', 'justificado', 'incapacidad'],
    },
    observaciones: { type: 'string', nullable: true },
    medico: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        nombreCompleto: { type: 'string' },
      },
    },
  },
};

export const medicoAsistenciasListSchema = {
  type: 'array',
  items: medicoAsistenciaResponseSchema,
};
