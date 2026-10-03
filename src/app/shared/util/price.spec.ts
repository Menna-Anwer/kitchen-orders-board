import { subtotalOf, calculateTotals } from './price';
import { MenuItem } from '../models/menu.model';

describe('pricing', () => {
  const menuById = new Map<string, MenuItem>([
    ['m2', { id: 'm2', name: '', category: 'Mains', price: 165 }],
    ['m5', { id: 'm5', name: '', category: 'Desserts', price: 75 }],
    ['m6', { id: 'm6', name: '', category: 'Drinks', price: 60 }],
  ]);

  it('calculates dine-in totals correctly', () => {
    const subtotal = subtotalOf(
      [
        { menuId: 'm2', qty: 2 },
        { menuId: 'm6', qty: 2 },
      ],
      menuById,
    );

    expect(subtotal).toBe(450);

    expect(calculateTotals(subtotal, 'dine-in')).toEqual({
      subtotal: 450,
      service: 54,
      vat: 70.56,
      total: 574.56,
    });
  });

  it('calculates delivery totals without service', () => {
    const subtotal = subtotalOf(
      [
        { menuId: 'm2', qty: 1 },
        { menuId: 'm5', qty: 1 },
      ],
      menuById,
    );

    expect(calculateTotals(subtotal, 'delivery')).toEqual({
      subtotal: 240,
      service: 0,
      vat: 33.6,
      total: 273.6,
    });
  });

  it('does not charge service for takeaway', () => {
    expect(
      calculateTotals(100, 'takeaway').service,
    ).toBe(0);
  });

  it('treats missing menu items and empty quantities as zero', () => {
    expect(
      subtotalOf(
        [
          { menuId: 'missing', qty: 3 },
          { menuId: 'm5', qty: null },
        ],
        menuById,
      ),
    ).toBe(0);
  });
});