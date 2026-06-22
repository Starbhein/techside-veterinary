# Manual Técnico y de Operación — techside-veterinary

## 1. Descripción del Sistema de Información Desarrollado

### 1.1 Portada interna

| Campo | Valor |
|-------|-------|
| Nombre del sistema | `techside-veterinary` |
| Versión | `0.0.1` [Fuente: `package.json`] |
| Tipo de sistema | Backend API REST |
| Fecha de elaboración | 2026-06-22 |
| Responsable de elaboración | `[PENDIENTE: nombre del equipo o autor]` |

### 1.2 Introducción y contexto

`techside-veterinary` es una API backend desarrollada para una clínica veterinaria. Su objetivo es soportar la operación diaria de agendamiento de citas, gestión de médicos, historial clínico de mascotas, recetas médicas, consultas y pagos. La aplicación está construida con NestJS sobre Node.js y persiste la información en PostgreSQL, utilizando Redis para la cola de correos electrónicos [Fuente: `README.md`, `package.json`].

Este manual está dirigido al personal técnico encargado del mantenimiento, despliegue y soporte del sistema. Se estructura siguiendo la *Guía para la Elaboración del Manual Técnico y de Operación del Sistema* del Departamento Nacional de Planeación (DNP) de Colombia, adaptada al contexto del proyecto.

### 1.3 Nombre del sistema y versión

- **Nombre:** `techside-veterinary` [Fuente: `package.json`].
- **Versión actual:** `0.0.1` [Fuente: `package.json`].
- **Repositorio:** `[PENDIENTE: URL pública o interna del repositorio]`.

### 1.4 Propósito general

Proporcionar una API REST que permita:

- Registrar y autenticar usuarios con roles diferenciados.
- Gestionar mascotas y sus datos clínicos.
- Agendar citas veterinarias con validaciones de negocio.
- Registrar consultas, recetas y pagos asociados a las citas.
- Consultar historial médico por mascota.
- Gestionar médicos, horarios, asistencias y sucursales.

Todo lo anterior se expone a través de endpoints documentados en Swagger y en `API-DOCS.md` [Fuente: `README.md`, `API-DOCS.md`].

### 1.5 Usuarios y roles

El sistema define tres roles en el enum `Rol` [Fuente: `prisma/schema.prisma#Rol`]:

| Rol | Identificador en código | Descripción |
|-----|------------------------|-------------|
| Cliente | `cliente` | Propietario de mascotas; puede agendar citas, registrar mascotas y consultar su información. |
| Médico | `medico` | Atiende citas, genera recetas, registra consultas y consulta horarios. |
| Administrador | `admin` | Gestiona médicos, horarios, asistencias, usuarios y tiene visibilidad total. |

La jerarquía de permisos es `cliente < médico < admin`; un usuario con rol superior puede acceder a endpoints restringidos para roles inferiores [Fuente: `src/common/guards/roles.guard.ts`].

### 1.6 Resumen de módulos funcionales

La API organiza su funcionalidad en los siguientes módulos de NestJS [Fuente: `src/app.module.ts`]:

| Módulo | Función principal |
|--------|-------------------|
| `AuthModule` | Login JWT, registro de usuarios, verificación de correo y reenvío de confirmación. |
| `UsuariosModule` | Búsqueda paginada de usuarios. |
| `PersonasModule` | Perfil del usuario autenticado (`me`). |
| `MascotasModule` | Gestión de mascotas por parte de clientes. |
| `CatalogosModule` | Catálogos de especies, razas, colores, tipos de pelo, patrones, comportamientos, alergias y servicios. |
| `MxDivisionesModule` | Divisiones geográficas y sucursales. |
| `CitasModule` | Agendamiento, cambio de estado y validaciones de citas. |
| `MedicosModule` | Perfiles, horarios y asistencias de médicos. |
| `RecetasModule` | Generación y consulta de recetas médicas. |
| `ConsultasModule` | Registro y consulta de datos clínicos de una atención. |
| `PagosModule` | Gestión de pagos por folio. |
| `HistorialMedicoModule` | Historial clínico por mascota y dashboard administrativo. |
| `ArchivosModule` | Almacenamiento local de archivos (fotos de perfil, carnets). |
| `EmailModule` | Envío de correos mediante Resend con cola Bull. |

### 1.7 Objetivos del sistema

- Centralizar la información de pacientes (mascotas), propietarios y médicos.
- Automatizar el agendamiento de citas con validaciones de disponibilidad.
- Gestionar el ciclo de vida de una cita: creación, pago, atención, receta, consulta y cierre.
- Proveer seguridad mediante autenticación JWT y control de acceso basado en roles.
- Ofrecer documentación interactiva de la API mediante Swagger.

### 1.8 Alcance y límites

**Dentro del alcance de este backend:**

- Gestión de usuarios, personas, mascotas, médicos, citas, recetas, consultas y pagos.
- Autenticación y autorización JWT.
- Exposición de endpoints REST documentados.
- Almacenamiento local de archivos en `./uploads`.
- Envío de correos electrónicos a través de Resend.

**Fuera del alcance de este backend (se marcan como `[PENDIENTE]`):**

- Frontend o aplicación móvil consumidora de la API.
- Infraestructura de producción (URL, certificados, proxy, balanceo).
- CI/CD, monitoreo, alertas y logs centralizados.
- Políticas de respaldo y recuperación ante desastres aprobadas por la organización.
- Navegadores y versiones mínimas soportadas por el cliente.

### 1.9 Licencia

El campo `license` de `package.json` indica `UNLICENSED` [Fuente: `package.json`]. El archivo `README.md` menciona una licencia MIT [Fuente: `README.md`], lo cual representa una inconsistencia pendiente de resolver. **Hasta que se aclare la situación legal, este manual documenta `UNLICENSED` como la licencia registrada en el manifiesto del proyecto.**

### 1.10 Glosario mínimo

| Término | Descripción |
|---------|-------------|
| Cita | Turno de atención veterinaria asociado a una mascota, un médico, un servicio y una sucursal. |
| Consulta | Registro clínico de una atención (signos vitales, notas de evolución). |
| Consultorio | Espacio físico dentro de una sucursal donde atiende un médico. |
| Folio de pago | Identificador único de un pago con formato `VET-YYYYMMDD-NNNN` [Fuente: `API-DOCS.md`]. |
| Mascota | Paciente veterinario; pertenece a un usuario cliente. |
| Receta | Documento médico con medicamentos indicados tras una consulta. |
| Sucursal | Unidad física de la clínica veterinaria. |
| Throttler | Módulo de limitación de peticiones incluido como dependencia pero no activado globalmente en `main` [Fuente: `src/app.module.ts`, `package.json`]. |
