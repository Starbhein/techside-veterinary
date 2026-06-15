import { normalizePhone } from './normalize-phone';

describe('normalizePhone', () => {
  it('should strip non-digit characters', () => {
    expect(normalizePhone('+1 55 1234 5678')).toBe('15512345678');
  });

  it('should strip + prefix and return digits', () => {
    expect(normalizePhone('+525555555555')).toBe('525555555555');
  });

  it('should allow short numbers without throwing', () => {
    expect(normalizePhone('123')).toBe('123');
  });

  it('should ignore letters and return only digits', () => {
    expect(normalizePhone('52a1234567')).toBe('521234567');
  });

  it('should return the same string when already clean', () => {
    expect(normalizePhone('15512345678')).toBe('15512345678');
  });
});
