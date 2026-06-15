import { calcularPrecioCita } from './calcular-precio-cita';

describe('calcularPrecioCita', () => {
  it('should sum service base price and specialty price', () => {
    expect(calcularPrecioCita(3500, 1500)).toBe(5000);
  });

  it('should handle Decimal-like objects', () => {
    expect(
      calcularPrecioCita({ toNumber: () => 3500 }, { toNumber: () => 1500 }),
    ).toBe(5000);
  });

  it('should handle string numbers', () => {
    expect(calcularPrecioCita('3500', '1500')).toBe(5000);
  });

  it('should default null service price to 0', () => {
    expect(calcularPrecioCita(null, 1500)).toBe(1500);
  });

  it('should default undefined specialty price to 0', () => {
    expect(calcularPrecioCita(3500, undefined)).toBe(3500);
  });

  it('should default both null/undefined to 0', () => {
    expect(calcularPrecioCita(null, undefined)).toBe(0);
  });
});
