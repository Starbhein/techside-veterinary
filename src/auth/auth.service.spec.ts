import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUsuariosService = {
    findByEmailOrPhone: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return accessToken and user for valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        telefono: '55512345678',
        passwordHash: 'hashed',
        rol: 'cliente',
        status: 'activo',
        personaId: 1,
      };
      mockUsuariosService.findByEmailOrPhone.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        emailOrPhone: 'test@example.com',
        password: 'Password123',
      });

      expect(mockUsuariosService.findByEmailOrPhone).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123', 'hashed');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'test@example.com',
        rol: 'cliente',
      });
      expect(result).toEqual({
        accessToken: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          rol: 'cliente',
        },
      });
    });

    it('should throw 401 for non-existent user without bcrypt compare', async () => {
      mockUsuariosService.findByEmailOrPhone.mockResolvedValue(null);

      await expect(
        service.login({
          emailOrPhone: 'nonexistent@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Credenciales inválidas. Inténtalo de nuevo.',
        ),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw 401 for inactive user without bcrypt compare', async () => {
      const mockUser = {
        id: 1,
        email: 'inactive@example.com',
        telefono: '55512345678',
        passwordHash: 'hashed',
        rol: 'cliente',
        status: 'inactivo',
        personaId: 1,
      };
      mockUsuariosService.findByEmailOrPhone.mockResolvedValue(mockUser);

      await expect(
        service.login({
          emailOrPhone: 'inactive@example.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Credenciales inválidas. Inténtalo de nuevo.',
        ),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw 401 for wrong password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        telefono: '55512345678',
        passwordHash: 'hashed',
        rol: 'cliente',
        status: 'activo',
        personaId: 1,
      };
      mockUsuariosService.findByEmailOrPhone.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          emailOrPhone: 'test@example.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Credenciales inválidas. Inténtalo de nuevo.',
        ),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith('WrongPassword', 'hashed');
    });
  });
});
