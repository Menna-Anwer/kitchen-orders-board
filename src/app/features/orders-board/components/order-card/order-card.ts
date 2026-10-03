import { DecimalPipe } from '@angular/common';

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { TranslocoPipe } from '@jsverse/transloco';

import { Order } from '../../../../core/models/order.model';

import { ElapsedPipe } from '../../../../shared/pipes/elapsed.pipe';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatCardModule, TranslocoPipe, ElapsedPipe],
  templateUrl: './order-card.html',
  styleUrl: './order-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCard {
  readonly order = input.required<Order>()
  readonly now = input.required<number>()
  readonly total = input(0)
  readonly pending = input(false)
  readonly moveForward = output<Order>()
  readonly open = output<Order>()
  readonly isLate = computed(() => {
    const order = this.order();
    if ( order.status === 'ready' ||order.status === 'served') {
      return false
    }
    const createdAt = new Date(order.createdAt).getTime();
    return (   this.now() - createdAt > 20 * 60 * 1000 );
  });
 getOrderTypeLabel(
    type: Order['type'],
  ): string {
    switch (type) {
      case 'dine-in':
        return 'orders.dineIn';
      case 'takeaway':
        return 'orders.takeaway';
      case 'delivery':
        return 'orders.delivery';
    }
  }
}
