import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  exhaustMap,
  forkJoin,
  fromEvent,
  map,
  merge,
  startWith,
  switchMap,
  timer,
} from 'rxjs';

import { MenuItem } from '../../core/models/menu.model';
import { Order, OrderStatus } from '../../core/models/order.model';
import { MenuService } from '../../core/services/menu.service';
import { OrdersService } from '../../core/services/orders.service';
import { NotificationService } from '../../core/notifications/notification.service';
import { NEXT_STATUS } from '../../core/models/order-labels';
import { MenuById, PriceBreakdown, priceOrder, toMenuById } from '../../shared/util/price';

export const POLL_INTERVAL_MS = 15_000;

@Injectable()
export class OrdersBoardStore {
  private readonly ordersService = inject(OrdersService);
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly ordersState = signal<Order[]>([]);
  private readonly menuState = signal<MenuItem[]>([]);
  private readonly loadingState = signal(true);
  private readonly errorState = signal<string | null>(null);
  private readonly pendingIdsState = signal<ReadonlySet<string>>(new Set());
  private readonly refreshSubject = new Subject<void>();
  readonly orders = this.ordersState.asReadonly();
  readonly menu = this.menuState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly pendingIds = this.pendingIdsState.asReadonly();
  readonly menuById = computed<MenuById>(() => {
    return toMenuById(this.menu());
  });
  readonly hasData = computed(() => {
    return this.orders().length > 0;
  });
  readonly totals = computed<ReadonlyMap<string, PriceBreakdown>>(() => {
    const menu = this.menuById();
    return new Map(this.orders().map((order) => [order.id, priceOrder(order, menu)]));
  });

  constructor() {
    this.startPolling();
  }
  retry(): void {
    this.errorState.set(null);
    this.refreshSubject.next();
  }
  advanceOrder(order: Order): void {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) {
      return;
    }
    if (this.pendingIds().has(order.id)) {
      return;
    }
    const previousStatus = order.status;
    this.setOrderStatus(order.id, nextStatus);
    this.setPending(order.id, true);
    this.ordersService
      .updateOrderStatus(order.id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.setPending(order.id, false);
          this.notificationService.success('orders.moveSuccess');
        },
        error: () => {
          this.setOrderStatus(order.id, previousStatus);
          this.setPending(order.id, false);
          this.notificationService.error('orders.moveFailed');
        },
      });
  }
  private startPolling(): void {
    const visibility = fromEvent(this.document, 'visibilitychange').pipe(
      startWith(null),
      map(() => {
        return this.document.visibilityState === 'visible';
      }),
      distinctUntilChanged(),
    );
    const polling = visibility.pipe(
      switchMap((isVisible) => {
        if (!isVisible) {
          return EMPTY;
        }
        return timer(0, POLL_INTERVAL_MS);
      }),
    );
    merge(polling, this.refreshSubject)
      .pipe(
        exhaustMap(() => this.loadSnapshot()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  private loadSnapshot() {
    return forkJoin({
      orders: this.ordersService.getOrders(),
      menu: this.menuService.getMenu(),
    }).pipe(
      catchError(() => {
        this.loadingState.set(false);
        this.errorState.set('orders.error');
        return EMPTY;
      }),
      map(({ orders, menu }) => {
        this.updateSnapshot(orders, menu);
      }),
    );
  }
  private updateSnapshot(orders: Order[], menu: MenuItem[]): void {
    const currentOrders = this.orders();
    const updatedOrders = orders.map((serverOrder) => {
      const isPending = this.pendingIds().has(serverOrder.id);
      if (!isPending) {
        return serverOrder;
      }
      return currentOrders.find((order) => order.id === serverOrder.id) ?? serverOrder;
    });
    this.ordersState.set(updatedOrders);
    this.menuState.set(menu);
    this.loadingState.set(false);
    this.errorState.set(null);
  }

  private setOrderStatus(id: string, status: OrderStatus): void {
    this.ordersState.update((orders) =>
      orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order,
      ),
    );
  }
  private setPending(id: string, pending: boolean): void {
    this.pendingIdsState.update((ids) => {
      const next = new Set(ids);
      if (pending) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
