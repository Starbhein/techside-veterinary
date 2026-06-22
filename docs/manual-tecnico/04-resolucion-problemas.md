# 4. Resolución de problemas

Este capítulo documenta los escenarios de error más frecuentes que pueden presentarse durante la operación del backend `techside-veterinary`. Cada escenario incluye el síntoma observable, la causa probable y los pasos de solución. La información se deriva de los códigos de estado documentados en `API-DOCS.md` y del comportamiento del código fuente.

## 4.1 Proceso de soporte

Ante un incidente, se recomienda seguir el siguiente orden:

1. Reproducir el error y anotar el código HTTP, el mensaje y la ruta afectada.
2. Revisar los logs de la API (`docker compose logs -f api` en entorno Docker o la consola en desarrollo).
3. Consultar las tablas de esta sección para identificar la causa.
4. Aplicar los pasos de solución sugeridos.
5. Si el problema persiste, escalar por el canal `[PENDIENTE: canal de escalamiento]`.

## 4.2 Códigos HTTP

La API utiliza los siguientes códigos de respuesta [Fuente: `API-DOCS.md`].

| Código | Significado | Causa típica |
|--------|-------------|--------------|
| `400` | Bad Request | Datos inválidos, validación fallida, fecha/hora no permitida. |
| `401` | Unauthorized | JWT ausente, expirado o inválido. |
| `403` | Forbidden | Usuario autenticado sin el rol jerárquico requerido. |
| `404` | Not Found | Recurso no existe o no es visible para el usuario actual. |
| `409` | Conflict | Conflicto de negocio (traslape de horario, cita duplicada, pago ya procesado). |
| `429` | Too Many Requests | Rate limit excedido (documentado como planificado; ver sección 3.6). |

## 4.3 Registro y autenticación

| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| Email o teléfono duplicado al registrar | HTTP `201` con mensaje genérico; se envía correo `account-exists`. | El email o teléfono ya existe en la base de datos; el sistema no revela la existencia por seguridad. | 1. Revisar el correo asociado a la cuenta.<br>2. Si es una cuenta propia, iniciar sesión o recuperar contraseña.<br>3. Si es un registro erróneo, usar otro email/teléfono. | `src/auth/auth.service.ts`, `API-DOCS.md` |
| Tipo de archivo inválido en registro | HTTP `400` o rechazo en carga. | `addressDoc` o `identityDoc` no son PDF, JPEG ni PNG. | 1. Verificar que los archivos sean `application/pdf`, `image/jpeg` o `image/png`.<br>2. Convertir el documento a un formato permitido.<br>3. Reintentar el registro. | `src/archivos/archivos.service.ts`, `API-DOCS.md` |
| Login fallido | HTTP `401` "Credenciales inválidas". | Email/teléfono o contraseña incorrectos, o el usuario no está activo. | 1. Verificar credenciales.<br>2. Confirmar que el usuario tenga `status = activo` en la base de datos.<br>3. Si olvidó la contraseña, restablecerla. | `src/auth/auth.service.ts`, `API-DOCS.md` |
| Usuario no verificado | HTTP `401` o imposibilidad de iniciar sesión. | El `UsuarioStatus` es `pendiente` (no ha verificado el correo). | 1. Solicitar reenvío de correo de verificación (`POST /auth/resend-confirmation`).<br>2. Verificar la bandeja de entrada y spam.<br>3. Hacer clic en el enlace de confirmación. | `src/auth/auth.service.ts`, `API-DOCS.md` |
| JWT ausente o inválido | HTTP `401` en endpoints protegidos. | No se envió el header `Authorization: Bearer <token>` o el token es inválido/expirado. | 1. Iniciar sesión para obtener un token nuevo.<br>2. Incluir el header en cada petición.<br>3. Verificar que `JWT_SECRET` sea el mismo en emisor y receptor. | `src/auth/strategies/jwt.strategy.ts`, `API-DOCS.md` |
| Permisos insuficientes | HTTP `403`. | El rol del usuario no cumple con la jerarquía requerida (`cliente < medico < admin`). | 1. Confirmar el rol del usuario autenticado.<br>2. Usar una cuenta con el rol adecuado.<br>3. Revisar el guard `RolesGuard` si el comportamiento no es el esperado. | `src/common/guards/roles.guard.ts`, `API-DOCS.md` |

## 4.4 Agendamiento de citas

| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| Cita con menos de 24 horas de anticipación | HTTP `400`. | La fecha/hora de la cita es menor a 24 horas desde el momento actual. | 1. Seleccionar una fecha/hora al menos 24 horas en el futuro.<br>2. Reintentar la creación. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Cita con más de 2 meses de anticipación | HTTP `400`. | La fecha de la cita excede 2 meses desde el momento actual. | 1. Seleccionar una fecha dentro de los próximos 2 meses.<br>2. Reintentar la creación. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Misma mascota, médico y día | HTTP `409`. | Ya existe una cita no cancelada para la misma combinación. | 1. Revisar las citas existentes de la mascota.<br>2. Cancelar la cita anterior si aplica, o elegir otro día/médico. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Traslape de horario del médico | HTTP `409`. | El médico ya tiene una cita en el horario solicitado. | 1. Consultar disponibilidad en `GET /api/v1/medicos/:id/disponibilidad-slots`.<br>2. Seleccionar un slot libre. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Traslape de consultorio o paciente | HTTP `409`. | El consultorio o el paciente ya están ocupados en ese horario. | 1. Verificar slots disponibles.<br>2. Seleccionar otro consultorio u horario. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Cita en otra sucursal sin gap de 2 horas | HTTP `409`. | Existe otra cita del mismo paciente en otra sucursal con menos de 2 horas de diferencia. | 1. Revisar citas próximas del paciente.<br>2. Ajustar la hora para dejar al menos 2 horas de margen. | `src/citas/citas.service.ts`, `API-DOCS.md` |
| Cambio de estado no permitido | HTTP `400`. | Se intentó una transición inválida en la máquina de estados. | 1. Revisar la máquina de estados en `API-DOCS.md`.<br>2. Aplicar la transición correcta. | `src/citas/citas.service.ts`, `API-DOCS.md` |

## 4.5 Pagos

| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| Pago ya procesado | HTTP `409`. | El folio ya fue pagado o cancelado. | 1. Verificar el estado del pago con `GET /api/v1/pagos/:folioPago`.<br>2. Si está `pagada`, no requiere acción.<br>3. Si está `cancelada`, revisar la cita asociada. | `src/pagos/pagos.service.ts`, `API-DOCS.md` |
| Folio no encontrado | HTTP `404`. | El folio no existe o el usuario no está autorizado a verlo. | 1. Verificar que el folio sea correcto.<br>2. Confirmar que el rol del usuario tenga visibilidad sobre el pago. | `src/pagos/pagos.service.ts`, `API-DOCS.md` |
| Cita sin pago asociado | Campo `pago: null` en historial. | La cita aún no genera un pago o fue creada antes de la generación automática. | 1. Verificar que la cita esté en estado `pendiente_de_pago`.<br>2. Si aplica, registrar el pago con `POST /api/v1/pagos`. | `src/citas/citas.service.ts`, `src/pagos/pagos.service.ts`, `API-DOCS.md` |

## 4.6 Carga de archivos

| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| Tipo MIME no permitido | HTTP `400` o rechazo silencioso. | El archivo no es PDF, JPEG ni PNG. | 1. Convertir el archivo a un formato permitido.<br>2. Reintentar la carga. | `src/archivos/archivos.service.ts` |
| Archivo no aparece después de subir | El registro no muestra URL del archivo. | Error al guardar en disco o directorio `uploads` no existe. | 1. Verificar que el directorio `./uploads` exista y tenga permisos de escritura.<br>2. Revisar logs de la API.<br>3. Reintentar la carga. | `src/archivos/archivos.service.ts`, `Dockerfile` |

## 4.7 Escenarios operativos

| Escenario / Error | Síntoma | Causa probable | Solución paso a paso | Fuente |
|-------------------|---------|----------------|----------------------|--------|
| La API no inicia | Contenedor `api` en estado `restarting` o logs con error al iniciar. | Variables de entorno faltantes, `DATABASE_URL` mal formada, o puerto ocupado. | 1. Revisar `docker compose logs api`.<br>2. Verificar que `.env` contenga todas las variables obligatorias.<br>3. Confirmar que `db` y `redis` estén sanos.<br>4. Revisar que el puerto `3000` no esté ocupado. | `docker-compose.yml`, `src/config/env.validation.ts` |
| PostgreSQL no responde | `pg_isready` falla; la API reporta errores de conexión. | Contenedor `db` no levantó, credenciales incorrectas o volumen corrupto. | 1. Ejecutar `docker compose ps`.<br>2. Verificar logs de `db`.<br>3. Confirmar que `POSTGRES_USER/PASSWORD/DB` coincidan con `DATABASE_URL`.<br>4. Si el volumen está corrupto, restaurar desde backup. | `docker-compose.yml` |
| Redis no responde | `redis-cli ping` no retorna `PONG`; cola de correos no procesa. | Contenedor `redis` no levantó o la URL es incorrecta. | 1. Verificar `docker compose ps`.<br>2. Revisar logs de `redis`.<br>3. Confirmar `REDIS_URL=redis://redis:6379` en `.env`. | `docker-compose.yml`, `src/app.module.ts` |
| Contenedores no levantan | `docker compose up` falla. | Error en `Dockerfile`, permisos o dependencias no resueltas. | 1. Revisar mensaje de error de Docker Compose.<br>2. Verificar que `pnpm-lock.yaml` no sea requerido con `--frozen-lockfile` (actualmente no existe).<br>3. Reconstruir con `docker compose up --build`. | `Dockerfile`, `docker-compose.yml` |
| `RESEND_API_KEY` no configurada | Error en runtime al enviar correos. | Falta la variable `RESEND_API_KEY` en `.env`. | 1. Configurar `RESEND_API_KEY` en `.env`.<br>2. Reiniciar el contenedor `api`. | `src/config/env.validation.ts`, `src/email/email.service.ts` |

## 4.8 Recolección de logs

### En Docker Compose

```bash
# Logs de todos los servicios
docker compose logs -f

# Logs solo de la API
docker compose logs -f api

# Logs con timestamps
docker compose logs -f --timestamps api
```

### En desarrollo local

La API imprime logs en la consola donde se ejecutó `pnpm run start:dev`. Los niveles de log dependen de `NODE_ENV` y de la configuración de NestJS [Fuente: `src/main.ts`].

## 4.9 Escalamiento

Para incidentes que no puedan resolverse con este manual, contactar al equipo responsable mediante `[PENDIENTE: definir canal de escalamiento y datos de contacto]`.
