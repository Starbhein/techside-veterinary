import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: { id: number; email: string; rol: string };
  }> {
    const user = await this.usuariosService.findByEmailOrPhone(
      dto.emailOrPhone,
    );

    if (!user || user.status !== 'activo') {
      throw new UnauthorizedException(
        'Credenciales inválidas. Inténtalo de nuevo.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException(
        'Credenciales inválidas. Inténtalo de nuevo.',
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      rol: user.rol,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}
