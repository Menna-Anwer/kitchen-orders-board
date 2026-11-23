import { Injectable } from '@angular/core';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';
import { MenuItem } from '../models/menu.model';
import { DEMO_MENU, DEMO_ORDERS } from './demo-seed';

export const DEMO_STORAGE_KEY = 'kitchen-orders-demo-v1';

/** Portfolio-only data. Never contacts or replaces the development JSON Server. */
@Injectable({ providedIn: 'root' })
export class DemoStore {
  private memory: Order[] | null = null;

  menu(): MenuItem[] {
    return structuredClone(DEMO_MENU);
  }

  orders(): Order[] {
    if (this.memory) return structuredClone(this.memory);
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) ?? 'null');
      if (Array.isArray(saved) && saved.every((order) => this.isOrder(order))) {
        this.memory = saved;
        return structuredClone(saved);
      }
    } catch {
      // Storage may be blocked or contain invalid JSON. Keep the demo usable.
    }
    this.memory = DEMO_ORDERS.map((order, index) => ({
      ...structuredClone(order),
      createdAt: new Date(Date.now() - (index + 1) * 4 * 60_000).toISOString(),
    }));
    return structuredClone(this.memory);
  }

  create(payload: CreateOrderPayload): Order {
    const orders = this.orders();
    const order: Order = {
      ...payload,
      id: crypto.randomUUID(),
      number: Math.max(1000, ...orders.map((item) => item.number)) + 1,
    };
    this.save([...orders, order]);
    return structuredClone(order);
  }

  updateStatus(id: string, status: OrderStatus): Order {
    const orders = this.orders();
    const order = orders.find((item) => item.id === id);
    if (!order) throw new Error('Demo order not found');
    order.status = status;
    this.save(orders);
    return structuredClone(order);
  }

  private save(orders: Order[]): void {
    this.memory = structuredClone(orders);
    try {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Private/restricted browsers can still use this tab's in-memory demo.
    }
  }

  private isOrder(value: unknown): value is Order {
    if (!value || typeof value !== 'object') return false;
    const order = value as Order;
    return typeof order.id === 'string' && Number.isFinite(order.number)
      && ['new', 'preparing', 'ready', 'served'].includes(order.status)
      && ['dine-in', 'takeaway', 'delivery'].includes(order.type)
      && typeof order.createdAt === 'string' && Number.isFinite(Date.parse(order.createdAt))
      && Array.isArray(order.items) && order.items.every((item) =>
        item && typeof item.menuId === 'string' && Number.isFinite(item.qty)
        && item.qty > 0 && typeof item.note === 'string');
  }
}
