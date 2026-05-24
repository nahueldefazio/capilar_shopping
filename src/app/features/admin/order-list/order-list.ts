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
  statusLabels = ORDER_STATUS_LABELS;
  statuses: OrderStatus[] = ['created', 'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];

  ngOnInit(): void {
    this.orders.set(this.orderService.getOrders());
  }

  updateStatus(order: Order, status: string): void {
    this.orderService.updateOrderStatus(order.id, status as OrderStatus);
    this.orders.set(this.orderService.getOrders());
  }
}
