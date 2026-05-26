import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models';
import { CurrencyArPipe } from '../../../shared/pipes/currency-ar.pipe';
import { DatePipe } from '@angular/common';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Creado',
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CurrencyArPipe, DatePipe],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class AdminOrderListComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  confirmingId = signal<string | null>(null);
  expandedId = signal<string | null>(null);
  statusLabels = ORDER_STATUS_LABELS;
  statuses: OrderStatus[] = ['created', 'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order.id, status as OrderStatus).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      },
    });
  }

  confirmPayment(order: Order): void {
    this.confirmingId.set(order.id);
    this.orderService.confirmPayment(order.id, 'approved').subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
        this.confirmingId.set(null);
      },
      error: () => this.confirmingId.set(null),
    });
  }

  toggleItems(orderId: string): void {
    this.expandedId.update((id) => (id === orderId ? null : orderId));
  }
}
