import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  constructor() {
    super('orders');
  }
  getOrders(): Observable<Order[]> {
    return this.getAll();
  }
  getOrderById(id: string): Observable<Order> {
    return this.getById(id);
  }
  createOrder(payload: CreateOrderPayload): Observable<Order> {
     return this.create(payload);
  }
  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    const payload: UpdateOrderStatusPayload = {
      status,
    };

    return this.patch(id, payload);
  }
}
