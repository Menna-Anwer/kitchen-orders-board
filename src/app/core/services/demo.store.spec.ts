import { DemoStore, DEMO_STORAGE_KEY } from './demo.store';
import { CreateOrderPayload } from '../models/order.model';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrdersService } from './orders.service';
import { MenuService } from './menu.service';
import { environment } from '../../../environments/environment';

const payload: CreateOrderPayload = {
  number: 1048, type: 'takeaway', table: null, phone: null,
  status: 'new', createdAt: new Date().toISOString(),
  items: [{ menuId: 'm1', qty: 2, note: '' }],
};

describe('Portfolio demo data', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it('loads sample menu and independent order copies', () => {
    const store = new DemoStore();
    expect(store.menu().length).toBeGreaterThan(0);
    const orders = store.orders();
    orders[0].status = 'new';
    expect(store.orders()[0].status).toBe('served');
  });

  it('creates, advances and restores an order after a new store is opened', () => {
    const store = new DemoStore();
    const order = store.create(payload);
    expect(order.id).toBeTruthy();
    expect(store.updateStatus(order.id, 'preparing').status).toBe('preparing');
    expect(new DemoStore().orders().find((item) => item.id === order.id)?.status).toBe('preparing');
  });

  it('replaces corrupt saved demo data with sample data', () => {
    localStorage.setItem(DEMO_STORAGE_KEY, '{bad json');
    expect(new DemoStore().orders().length).toBeGreaterThan(0);
    localStorage.setItem(DEMO_STORAGE_KEY, '[{"id":"invalid"}]');
    expect(new DemoStore().orders()[0].items.length).toBeGreaterThan(0);
  });

  it('works in memory when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const store = new DemoStore();
    const order = store.create(payload);
    expect(store.orders().some((item) => item.id === order.id)).toBe(true);
  });

  it('does not write changes for missing orders', () => {
    expect(() => new DemoStore().updateStatus('missing', 'ready')).toThrow();
    expect(localStorage.getItem(DEMO_STORAGE_KEY)).toBeNull();
  });
});

describe('Demo service routing', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });
  afterEach(() => { environment.demo = false; localStorage.clear(); });

  it('serves menu, detail, create and status locally without HTTP in demo mode', async () => {
    environment.demo = true;
    const orders = TestBed.inject(OrdersService);
    expect((await firstValueFrom(TestBed.inject(MenuService).getMenu())).length).toBeGreaterThan(0);
    expect((await firstValueFrom(orders.getOrders())).length).toBeGreaterThan(0);
    const order = await firstValueFrom(orders.createOrder(payload));
    expect((await firstValueFrom(orders.getOrderById(order.id))).id).toBe(order.id);
    expect((await firstValueFrom(orders.updateOrderStatus(order.id, 'ready'))).status).toBe('ready');
    await expect(firstValueFrom(orders.getOrderById('missing'))).rejects.toThrow();
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });

  it('keeps development JSON Server requests unchanged', async () => {
    environment.demo = false;
    const result = firstValueFrom(TestBed.inject(OrdersService).getOrders());
    TestBed.inject(HttpTestingController).expectOne('http://localhost:3000/orders').flush([]);
    expect(await result).toEqual([]);
  });
});
