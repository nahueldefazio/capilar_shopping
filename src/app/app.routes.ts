import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/products/products').then((m) => m.ProductsComponent),
  },
  {
    path: 'productos/:slug',
    loadComponent: () => import('./features/product-detail/product-detail').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'peluquerias',
    loadComponent: () => import('./features/salon/salon').then((m) => m.SalonComponent),
  },
  {
    path: 'mayorista',
    loadComponent: () => import('./features/wholesale/wholesale').then((m) => m.WholesaleComponent),
  },
  {
    path: 'combos',
    loadComponent: () => import('./features/combos/combos').then((m) => m.CombosComponent),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./features/cart/cart').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'revisar-pedido',
    loadComponent: () => import('./features/order-review/order-review').then((m) => m.OrderReviewComponent),
  },
  {
    path: 'pago-resultado',
    loadComponent: () =>
      import('./features/payment-result/payment-result').then((m) => m.PaymentResultComponent),
  },
  {
    path: 'confirmacion/:id',
    loadComponent: () =>
      import('./features/order-confirmation/order-confirmation').then((m) => m.OrderConfirmationComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login/login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () => import('./features/admin/product-list/product-list').then((m) => m.AdminProductListComponent),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./features/admin/product-form/product-form').then((m) => m.AdminProductFormComponent),
      },
      {
        path: 'productos/editar/:id',
        loadComponent: () => import('./features/admin/product-form/product-form').then((m) => m.AdminProductFormComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/order-list/order-list').then((m) => m.AdminOrderListComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
