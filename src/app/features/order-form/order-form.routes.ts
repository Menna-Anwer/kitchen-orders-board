import { Routes } from '@angular/router';

export const ORDER_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./page/order-form/order-form').then((m) => m.OrderForm),
  },
];
