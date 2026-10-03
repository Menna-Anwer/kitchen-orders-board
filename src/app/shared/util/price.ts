import { OrderType } from '../../core/models/order.model';
import { Order } from '../../core/models/order.model';
import { MenuItem } from '../../core/models/menu.model';

export const SERVICE_RATE = 0.12;
export const VAT_RATE = 0.14;
export interface PriceBreakdown {
  subtotal: number;
  service: number;
  vat: number;
  total: number;
}
export type MenuById = ReadonlyMap<string, MenuItem>;
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
export function toMenuById(menu: MenuItem[]): MenuById {
  return new Map(menu.map((item) => [item.id, item]));
}
export function subtotalOf(
  items: readonly {
    menuId: string;
    qty: number | null;
  }[],
  menuById: MenuById,
): number {
  const subtotal = items.reduce((sum, item) => {
    const price = menuById.get(item.menuId)?.price ?? 0;
    const quantity = item.qty ?? 0;
    return sum + price * quantity;
  }, 0);
  return round2(subtotal);
}
export function calculateTotals(subtotal: number, type: OrderType): PriceBreakdown {
  const roundedSubtotal = round2(subtotal);
  const service = type === 'dine-in' ? round2(roundedSubtotal * SERVICE_RATE) : 0;
  const vat = round2((roundedSubtotal + service) * VAT_RATE);
  return {
    subtotal: roundedSubtotal,
    service,
    vat,
    total: round2(roundedSubtotal + service + vat),
  };
}
export function priceOrder(order: Order, menuById: MenuById): PriceBreakdown {
  const subtotal = subtotalOf(order.items, menuById);
  return calculateTotals(subtotal, order.type);
}
