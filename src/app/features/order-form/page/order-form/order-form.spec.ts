import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OrderForm } from './order-form';
import { MenuService } from '../../../../core/services/menu.service';
import { OrdersService } from '../../../../core/services/orders.service';
import { testTranslations } from '../../../../../test-translations';

describe('OrderForm validation', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [OrderForm, testTranslations()],
      providers: [provideRouter([]),
        { provide: MenuService, useValue: { getMenu: () => of([{ id: 'm1', name: 'Sample', category: 'Mains', price: 10 }]) } },
        { provide: OrdersService, useValue: { getOrders: () => of([]) } }],
    });
    const fixture = TestBed.createComponent(OrderForm);
    return { fixture, form: fixture.componentInstance };
  }

  it('rejects blank, zero, fractional and over-limit quantities', () => {
    const { fixture, form } = setup();
    const quantity = form.items.at(0).controls.qty;
    for (const invalid of [null, 0, 1.5, 21]) {
      quantity.setValue(invalid as number);
      expect(quantity.invalid).toBe(true);
    }
    quantity.setValue(2);
    expect(quantity.valid).toBe(true);
    fixture.destroy();
  });

  it('requires integer tables and validates delivery phone instead when type changes', () => {
    const { fixture, form } = setup();
    form.form.controls.table.setValue(1.5);
    expect(form.form.controls.table.invalid).toBe(true);
    form.form.controls.table.setValue(3);
    expect(form.form.controls.table.valid).toBe(true);
    form.form.controls.type.setValue('delivery');
    expect(form.form.controls.table.value).toBeNull();
    expect(form.form.controls.phone.invalid).toBe(true);
    form.form.controls.phone.setValue('01012345678');
    expect(form.form.controls.phone.valid).toBe(true);
    fixture.destroy();
  });
});
