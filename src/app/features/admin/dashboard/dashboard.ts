import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models';
import { CurrencyArPipe } from '../../../shared/pipes/currency-ar.pipe';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe, DatePipe, LoadingComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboardComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  stats = signal({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    todaySales: 0,
    pendingOrders: 0,
  });

  recentOrders = signal<Order[]>([]);
  loading = signal(true);

  constructor() {
    effect(() => {
      const products = this.productService.products();
      this.stats.update((s) => ({
        ...s,
        totalProducts: products.length,
        activeProducts: products.filter((p) => p.isActive).length,
      }));
    });
  }

  ngOnInit(): void {
    this.productService.load();

    this.orderService.getOrders().subscribe((orders) => {
      this.loading.set(false);
      const today = new Date().toDateString();
      const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);

      this.recentOrders.set(orders.slice(0, 5));
      this.stats.update((s) => ({
        ...s,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        todaySales: todayOrders.reduce((acc, o) => acc + o.total, 0),
        pendingOrders: orders.filter((o) => ['created', 'pending_payment'].includes(o.status)).length,
      }));
    });
  }
}
