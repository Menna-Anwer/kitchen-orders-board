import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OrdersBoard } from './orders-board';
import { testTranslations } from '../../../../../test-translations';

describe('OrdersBoard', () => {
  it('creates with routing, translation and isolated HTTP providers', async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersBoard, testTranslations()],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(OrdersBoard);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });
});
