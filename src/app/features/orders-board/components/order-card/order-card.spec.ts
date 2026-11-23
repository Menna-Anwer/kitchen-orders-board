import { TestBed } from '@angular/core/testing';
import { OrderCard } from './order-card';
import { testTranslations } from '../../../../../test-translations';

describe('OrderCard', () => {
  it('renders its required inputs and emits the selected order', async () => {
    await TestBed.configureTestingModule({ imports: [OrderCard, testTranslations()] }).compileComponents();
    const fixture = TestBed.createComponent(OrderCard);
    const order = { id: 'test', number: 42, type: 'dine-in', table: 1, phone: null, status: 'new', createdAt: new Date().toISOString(), items: [] };
    fixture.componentRef.setInput('order', order);
    fixture.componentRef.setInput('now', Date.now());
    const moved = vi.fn();
    fixture.componentInstance.moveForward.subscribe(moved);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('#42');
    fixture.nativeElement.querySelector('.order-card__move').click();
    expect(moved).toHaveBeenCalledWith(order);
    fixture.componentRef.setInput('pending', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.order-card__move').disabled).toBe(true);
    fixture.destroy();
  });
});
