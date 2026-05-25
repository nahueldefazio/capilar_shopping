import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItem, Customer, Order, OrderStatus, PaymentMethod, DeliveryMethod } from '../models';
import { environment } from '../../../environments/environment';

export interface CheckoutData {
  customer: Customer;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
}

interface CheckoutPayload {
  customer: Customer;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private _orders = signal<Order[]>([]);

  createOrder(data: CheckoutData, items: CartItem[]): Observable<Order> {
    const payload: CheckoutPayload = {
      customer: data.customer,
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
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/status`, { status }).pipe(
      tap((updated) => this._orders.update((list) => list.map((o) => (o.id === updated.id ? updated : o))))
    );
  }
}
