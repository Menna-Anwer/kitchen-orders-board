import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslocoPipe } from '@jsverse/transloco';
import { StateMessage } from '../../../../shared/components/state-message/state-message';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, catchError, of } from 'rxjs';
import { MenuItem } from '../../../../core/models/menu.model';
import { Order, OrderType } from '../../../../core/models/order.model';
import { MenuService } from '../../../../core/services/menu.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { toMenuById, PriceBreakdown, priceOrder } from '../../../../shared/util/price';
interface OrderLine {
  name: string;
  qty: number;
  note: string;
  lineTotal: number;
}
@Component({
  selector: 'app-order-details',
  imports: [DecimalPipe, MatButtonModule, MatCardModule, TranslocoPipe, StateMessage,DatePipe],
  templateUrl: './order-details.html',
  styleUrl: './order-details.scss',
})
export class OrderDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly menuService = inject(MenuService);
  private readonly destroyRef = inject(DestroyRef);
  readonly order = signal<Order | null>(null);
  readonly menu = signal<MenuItem[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly lines = computed<OrderLine[]>(() => {
    const order = this.order();
    if (!order) {
      return [];
    }
    const menuById = toMenuById(this.menu());
    return order.items.map((item) => {
      const menuItem = menuById.get(item.menuId);
      return {
        name: menuItem?.name ?? 'Unknown item',
        qty: item.qty,
        note: item.note,
        lineTotal: (menuItem?.price ?? 0) * item.qty,
      };
    });
  });
  readonly totals = computed<PriceBreakdown | null>(() => {
    const order = this.order();
    if (!order) {
      return null;
    }
    return priceOrder(order, toMenuById(this.menu()));
  });
  constructor() {
    this.load();
  }
  retry(): void {
    this.load();
  }
  goBack(): void {
    this.router.navigate(['/orders']);
  }
  private load(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false);
      this.error.set('orders.detailsNotFound');
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    forkJoin({
      order: this.ordersService.getOrderById(id),
      menu: this.menuService.getMenu(),
    })
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          this.error.set('orders.detailsError');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.order.set(result.order);
        this.menu.set(result.menu);
        this.isLoading.set(false);
        this.error.set(null);
      });
  }

  protected readonly typeTranslationKey: Record<OrderType, string> = {
  'dine-in': 'orders.dineIn',
  takeaway: 'orders.takeaway',
  delivery: 'orders.delivery',
};
}
