import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem, Order, OrderStatus, PaymentStatus, ShippingStatus } from '../models';
import { environment } from '../../../environments/environment';

export interface OrderShippingInput {
  province: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  apartment?: string;
}

export interface CheckoutData {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    customerType: string;
    address?: string;
    province?: string;
    city?: string;
    postalCode?: string;
  };
  shipping?: OrderShippingInput;
  paymentMethod: string;
  deliveryMethod: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private _orders = signal<Order[]>([]);

  createOrder(data: CheckoutData, items: CartItem[]): Observable<Order> {
    const payload = {
      customer: data.customer,
      shipping: data.shipping,
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paymentMethod: data.paymentMethod,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
    };
    return this.http.post<Order>(`${this.base}/checkout/create-order`, payload).pipe(
      tap((order) => this._orders.update((list) => [order, ...list]))
    );
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`).pipe(
      tap((orders) => this._orders.set(orders))
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/checkout/order/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/status`, { status }).pipe(
      tap((updated) => this._orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o))))
    );
  }

  confirmPayment(id: string, paymentStatus: PaymentStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/payment-status`, { paymentStatus }).pipe(
      tap((updated) => this._orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o))))
    );
  }

  updateShipping(id: string, dto: { shippingStatus?: ShippingStatus; trackingNumber?: string; trackingUrl?: string }): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/shipping`, dto).pipe(
      tap((updated) => this._orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o))))
    );
  }

  createMercadoPagoPreference(orderId: number): Observable<{ preferenceId: string; initPoint: string }> {
    return this.http.post<{ preferenceId: string; initPoint: string }>(
      `${this.base}/payments/mercadopago/create-preference`,
      { orderId },
    );
  }
}
