import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ActivatedRoute, Router } from '@angular/router';

import { interval, startWith } from 'rxjs';

import { TranslocoPipe } from '@jsverse/transloco';

import { Order, OrderStatus, OrderType } from '../../../../core/models/order.model';

import { StateMessage } from '../../../../shared/components/state-message/state-message';

import { BoardFilters } from '../../components/board-filters/board-filters';
import { BoardColumn } from '../../components/board-column/board-column';

import { OrdersBoardStore } from '../../orders-board.store';

@Component({
  selector: 'app-orders-board',
  standalone: true,
  imports: [TranslocoPipe, StateMessage, BoardFilters, BoardColumn],
  providers: [OrdersBoardStore],
  templateUrl: './orders-board.html',
  styleUrl: './orders-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersBoard {
  protected readonly store = inject(OrdersBoardStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly now = signal(Date.now());
  protected readonly statuses: OrderStatus[] = ['new', 'preparing', 'ready', 'served'];
  protected readonly search = signal('');
  protected readonly type = signal<OrderType | ''>('');
  protected readonly filteredOrders = computed(() => {
    const search = this.search().trim().toLowerCase();
    const type = this.type();
    return this.store.orders().filter((order) => {
      const matchesSearch =
        !search ||
        order.number.toString().includes(search) ||
        Boolean(order.table?.toString().includes(search));
      const matchesType = !type || order.type === type;
      return matchesSearch && matchesType;
    });
  });
  constructor() {
    this.readQueryParams();
    this.startClock();
  }
  protected ordersByStatus(status: OrderStatus): Order[] {
    return this.filteredOrders().filter((order) => order.status === status);
  }
  protected openOrder(id: string): void {
    this.router.navigate(['/orders', id]);
  }
  protected moveOrder(order: Order): void {
    this.store.advanceOrder(order);
  }
  protected onSearchChange(value: string): void {
    this.search.set(value);
    this.updateQueryParams();
  }
  protected onTypeChange(value: OrderType | ''): void {
    this.type.set(value);
    this.updateQueryParams();
  }
  private readQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    this.search.set(params.get('search') ?? '');
    const type = params.get('type');
    if (type === 'dine-in' || type === 'takeaway' || type === 'delivery') {
      this.type.set(type);
    }
  }
  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search() || null,
        type: this.type() || null,
      },
      queryParamsHandling: 'merge',
    });
  }
  private startClock(): void {
    interval(1000)
      .pipe(startWith(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.now.set(Date.now());
      });
  }
}
