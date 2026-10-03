import { Routes } from '@angular/router';

export const ORDER_DETAILS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./page/order-details/order-details').then((m) => m.OrderDetails),
  },
];
