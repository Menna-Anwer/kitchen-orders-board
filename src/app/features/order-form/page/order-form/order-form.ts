import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Router, RouterLink } from '@angular/router';

import { catchError, forkJoin, of } from 'rxjs';

import { DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { TranslocoPipe } from '@jsverse/transloco';
import { MenuItem } from '../../../../core/models/menu.model';
import { OrderType, CreateOrderPayload } from '../../../../core/models/order.model';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { MenuService } from '../../../../core/services/menu.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { StateMessage } from '../../../../shared/components/state-message/state-message';
import { toMenuById, subtotalOf, calculateTotals } from '../../../../shared/util/price';
import { atLeastOneItemValidator, egyptianMobileValidator } from '../../validators/form.validators';

interface OrderItemControls {
  menuId: FormControl<string>;
  qty: FormControl<number>;
  note: FormControl<string>;
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    TranslocoPipe,
    StateMessage,
  ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderForm {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly menu = signal<MenuItem[]>([]);
  readonly nextOrderNumber = signal<number | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly runningTotal = signal(0);

  readonly form = this.fb.group({
    type: this.fb.nonNullable.control<OrderType>('dine-in'),
    table: this.fb.control<number | null>(null),
    phone: this.fb.nonNullable.control(''),
    items: this.fb.array<FormGroup<OrderItemControls>>([], {
      validators: [atLeastOneItemValidator],
    }),
  });

  constructor() {
    this.addItem();
    this.setupFormListeners();
    this.load();
  }
  get items(): FormArray<FormGroup<OrderItemControls>> {
    return this.form.controls.items;
  }
  addItem(): void {
    this.items.push(this.createItem());
    this.updateRunningTotal();
  }
  removeItem(index: number): void {
    this.items.removeAt(index);
    this.updateRunningTotal();
  }
  retry(): void {
    this.load();
  }
  submit(): void {
    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const number = this.nextOrderNumber();
    if (number === null) return;

    this.submitting.set(true);
    const type = this.form.controls.type.value;
    const payload: CreateOrderPayload = {
      number,

      type,

      table: type === 'dine-in' ? this.form.controls.table.value : null,
      phone: type === 'delivery' ? this.form.controls.phone.value.trim() : null,
      status: 'new',
      createdAt: new Date().toISOString(),
      items: this.items.getRawValue().map((item) => ({
        menuId: item.menuId,
        qty: item.qty,
        note: item.note.trim(),
      })),
    };
    this.ordersService
      .createOrder(payload)
      .pipe(
        catchError(() => {
          this.submitting.set(false);
          this.notificationService.error('orders.createFailed');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((order) => {
        if (!order) {
          return;
        }
        this.notificationService.success('orders.createSuccess');
        this.router.navigate(['/orders']);
      });
  }

  private createItem(): FormGroup<OrderItemControls> {
    return this.fb.nonNullable.group({
      menuId: this.fb.nonNullable.control('', Validators.required),
      qty: this.fb.nonNullable.control(1, [Validators.min(1), Validators.max(20)]),
      note: this.fb.nonNullable.control(''),
    });
  }

  private setupFormListeners(): void {
    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        this.updateConditionalValidators(type);
        this.updateRunningTotal();
      });

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateRunningTotal();
    });
    this.updateConditionalValidators(this.form.controls.type.value);
  }

  private updateConditionalValidators(type: OrderType): void {
    const table = this.form.controls.table;
    const phone = this.form.controls.phone;
    table.clearValidators();
    phone.clearValidators();
    if (type === 'dine-in') {
      table.addValidators([Validators.required, Validators.min(1), Validators.max(40)]);
      phone.setValue('', {
        emitEvent: false,
      });
    }

    if (type === 'delivery') {
      phone.addValidators([Validators.required, egyptianMobileValidator]);
      table.setValue(null, {
        emitEvent: false,
      });
    }

    if (type === 'takeaway') {
      table.setValue(null, {
        emitEvent: false,
      });
      phone.setValue('', {
        emitEvent: false,
      });
    }

    table.updateValueAndValidity({
      emitEvent: false,
    });

    phone.updateValueAndValidity({
      emitEvent: false,
    });
  }

  private updateRunningTotal(): void {
    const menuById = toMenuById(this.menu());
    const subtotal = subtotalOf(this.items.getRawValue(), menuById);
    const total = calculateTotals(subtotal, this.form.controls.type.value).total;
    this.runningTotal.set(total);
  }

  private load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    forkJoin({
      menu: this.menuService.getMenu(),
      orders: this.ordersService.getOrders(),
    })
      .pipe(
        catchError(() => {
          this.isLoading.set(false);
          this.error.set('orders.formLoadError');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }
        this.menu.set(result.menu);
        const maxNumber = result.orders.reduce((max, order) => Math.max(max, order.number), 0);
        this.nextOrderNumber.set(maxNumber + 1);
        this.isLoading.set(false);
        this.updateRunningTotal();
      });
  }
}
