import { environment } from '../../../environments/environment';
import { DemoStore } from './demo.store';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, of, throwError } from 'rxjs';
import {
  CreateOrderPayload,
  Order,
  OrderStatus,
  UpdateOrderStatusPayload,
} from '../models/order.model';
import { AbstractCrudService } from './abstract-crud.service';

@Injectable({
  providedIn: 'root',
})
export class OrdersService extends AbstractCrudService<Order> {
  private readonly demo = inject(DemoStore);
  constructor() {
    super('orders');
  }
  getOrders(): Observable<Order[]> {
    return environment.demo ? defer(() => of(this.demo.orders())) : this.getAll();
  }
  getOrderById(id: string): Observable<Order> {
    return environment.demo ? defer(() => {
      const order = this.demo.orders().find((item) => item.id === id);
      return order ? of(order) : throwError(() => new Error('Order not found'));
    }) : this.getById(id);
  }
  createOrder(payload: CreateOrderPayload): Observable<Order> {
     return environment.demo ? defer(() => of(this.demo.create(payload))) : this.create(payload);
  }
  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    const payload: UpdateOrderStatusPayload = {
      status,
    };

    return environment.demo ? defer(() => of(this.demo.updateStatus(id, status))) : this.patch(id, payload);
  }
}
