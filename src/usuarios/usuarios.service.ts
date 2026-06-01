import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { Env } from '../config/env.validation';

@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async findByEmailOrPhone(emailOrPhone: string): Promise<
    | (Usuario & {
        persona: {
          id: number;
          nombreCompleto: string;
          telefono: string;
          sucursalId: number;
        };
      })
    | null
  > {
    const isEmail = emailOrPhone.includes('@');

    if (isEmail) {
      return this.prisma.usuario.findUnique({
        where: { email: emailOrPhone.toLowerCase() },
        include: {
          persona: {
            select: {
              id: true,
              nombreCompleto: true,
              telefono: true,
              sucursalId: true,
            },
          },
        },
      });
    }

    return this.prisma.usuario.findUnique({
      where: { telefono: emailOrPhone },
      include: {
        persona: {
          select: {
            id: true,
            nombreCompleto: true,
            telefono: true,
            sucursalId: true,
          },
        },
      },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.get('BCRYPT_ROUNDS', { infer: true });
    return bcrypt.hash(password, rounds);
  }

  async createUser(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    const hashedPassword = await this.hashPassword(data.passwordHash);
    return this.prisma.usuario.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
  }
}
