import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: number;
  email: string;
  rol: Rol;
}
