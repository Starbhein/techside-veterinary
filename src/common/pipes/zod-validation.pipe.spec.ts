import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
  });

  it('should pass valid data through unchanged', () => {
    const pipe = new ZodValidationPipe(schema);
    const data = { name: 'John', age: 30 };

    const result = pipe.transform(data);

    expect(result).toEqual(data);
  });

  it('should throw BadRequestException with details for invalid data', () => {
    const pipe = new ZodValidationPipe(schema);
    const data = { name: '', age: -1 };

    try {
      pipe.transform(data);
      fail('Expected BadRequestException');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as Record<
        string,
        unknown
      >;
      expect(response.statusCode).toBe(400);
      expect(response.message).toBe('Validation failed');
      expect(response.error).toBe('Bad Request');
      expect(Array.isArray(response.details)).toBe(true);
      expect(
        (response.details as Array<Record<string, unknown>>).length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        (response.details as Array<Record<string, unknown>>)[0],
      ).toHaveProperty('path');
      expect(
        (response.details as Array<Record<string, unknown>>)[0],
      ).toHaveProperty('message');
    }
  });
});
