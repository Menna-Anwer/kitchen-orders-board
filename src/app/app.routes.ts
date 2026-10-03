import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'orders',
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders-board/page/orders-board/orders-board').then((m) => m.OrdersBoard),
  },
  {
    path: 'orders/new',
    loadChildren: () =>
      import('./features/order-form/order-form.routes').then((m) => m.ORDER_FORM_ROUTES),
  },
  {
    path: 'orders/:id',
    loadChildren: () =>
      import('./features/order-details/order-details.routes').then((m) => m.ORDER_DETAILS_ROUTES),
  },

  {
    path: '**',
    redirectTo: 'orders',
  },
];
