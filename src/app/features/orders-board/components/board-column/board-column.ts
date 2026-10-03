import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Order, OrderStatus } from '../../../../core/models/order.model';
import { PriceBreakdown } from '../../../../shared/util/price';
import { OrderCard } from '../order-card/order-card';

@Component({
  selector: 'app-board-column',
  standalone: true,
  imports: [TranslocoPipe, OrderCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardColumn {
  readonly status = input.required<OrderStatus>();
  readonly orders = input.required<Order[]>();
  readonly now = input.required<number>();
  readonly totals = input.required<ReadonlyMap<string, PriceBreakdown>>();
  readonly pendingIds = input.required<ReadonlySet<string>>();
  readonly moveForward = output<Order>();
  readonly open = output<Order>();
}
