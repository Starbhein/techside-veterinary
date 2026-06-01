import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsuariosService', () => {
  let service: UsuariosService;

  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(12),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmailOrPhone', () => {
    it('should find user by email (case-insensitive match by lowercasing)', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        telefono: '55512345678',
        passwordHash: 'hash',
        rol: 'cliente',
        status: 'activo',
        personaId: 1,
        persona: {
          id: 1,
          nombreCompleto: 'Test',
          telefono: '55512345678',
          sucursalId: 1,
        },
      };
      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmailOrPhone('Test@Example.COM');

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
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
      expect(result).toEqual(mockUser);
    });

    it('should find user by phone', async () => {
      const mockUser = {
        id: 2,
        email: 'other@example.com',
        telefono: '55598765432',
        passwordHash: 'hash',
        rol: 'medico',
        status: 'activo',
        personaId: 2,
        persona: {
          id: 2,
          nombreCompleto: 'Other',
          telefono: '55598765432',
          sucursalId: 1,
        },
      };
      mockPrisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmailOrPhone('55598765432');

      expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { telefono: '55598765432' },
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
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const result = await service.findByEmailOrPhone(
        'nonexistent@example.com',
      );

      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt using config rounds', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.hashPassword('plainPassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
      expect(result).toBe('hashedPassword');
    });
  });

  describe('createUser', () => {
    it('should hash password before creating user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const mockUser = { id: 1, email: 'test@example.com' };
      mockPrisma.usuario.create.mockResolvedValue(mockUser);

      const result = await service.createUser({
        email: 'test@example.com',
        telefono: '55512345678',
        passwordHash: 'plainPassword',
        rol: 'cliente',
        persona: { connect: { id: 1 } },
      } as never);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 12);
      expect(mockPrisma.usuario.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          telefono: '55512345678',
          passwordHash: 'hashedPassword',
          rol: 'cliente',
          persona: { connect: { id: 1 } },
        },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
