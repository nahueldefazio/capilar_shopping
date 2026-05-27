import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, ShippingStatus } from '../../../core/models';
import { CurrencyArPipe } from '../../../shared/pipes/currency-ar.pipe';
import { DatePipe } from '@angular/common';
import { LoadingComponent } from '../../../shared/components/loading/loading';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  created: 'Creado',
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  label_created: 'Etiqueta creada',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

@Component({
  selector: 'app-admin-order-list',
  standalone: true,
  imports: [CurrencyArPipe, DatePipe, LoadingComponent, ReactiveFormsModule],
  templateUrl: './order-list.html',
  styleUrl: './order-list.scss',
})
export class AdminOrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private fb = inject(FormBuilder);

  orders = signal<Order[]>([]);
  loading = signal(true);
  confirmingId = signal<string | null>(null);
  expandedId = signal<string | null>(null);
  trackingEditId = signal<string | null>(null);
  savingTrackingId = signal<string | null>(null);

  statusLabels = ORDER_STATUS_LABELS;
  shippingStatusLabels = SHIPPING_STATUS_LABELS;
  statuses: OrderStatus[] = ['created', 'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'];
  shippingStatuses: ShippingStatus[] = ['pending', 'preparing', 'label_created', 'shipped', 'delivered', 'cancelled'];

  trackingForm = this.fb.group({
    shippingStatus: ['pending' as ShippingStatus],
    trackingNumber: [''],
    trackingUrl: [''],
  });

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

  openTrackingEdit(order: Order): void {
    this.trackingEditId.set(order.id);
    this.trackingForm.patchValue({
      shippingStatus: (order.shipping?.status ?? 'pending') as ShippingStatus,
      trackingNumber: order.shipping?.trackingNumber ?? '',
      trackingUrl: order.shipping?.trackingUrl ?? '',
    });
  }

  cancelTrackingEdit(): void {
    this.trackingEditId.set(null);
  }

  saveTracking(order: Order): void {
    const v = this.trackingForm.value;
    this.savingTrackingId.set(order.id);
    this.orderService
      .updateShipping(order.id, {
        shippingStatus: v.shippingStatus as ShippingStatus,
        trackingNumber: v.trackingNumber ?? undefined,
        trackingUrl: v.trackingUrl ?? undefined,
      })
      .subscribe({
        next: (updated) => {
          this.orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o)));
          this.savingTrackingId.set(null);
          this.trackingEditId.set(null);
        },
        error: () => this.savingTrackingId.set(null),
      });
  }
}
