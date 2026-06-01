import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let app: INestApplication;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should return 200 for valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'valid-token',
        user: { id: 1, email: 'test@example.com', rol: 'cliente' },
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ emailOrPhone: 'test@example.com', password: 'Password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        accessToken: 'valid-token',
        user: { id: 1, email: 'test@example.com', rol: 'cliente' },
      });
    });

    it('should return 400 for invalid body (missing password)', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ emailOrPhone: 'test@example.com' })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.statusCode).toBe(400);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for password too short', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ emailOrPhone: 'test@example.com', password: 'short' })
        .expect(400);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException(
          'Credenciales inválidas. Inténtalo de nuevo.',
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ emailOrPhone: 'test@example.com', password: 'Password123' })
        .expect(401);

      expect(response.status).toBe(401);
    });
  });
});
