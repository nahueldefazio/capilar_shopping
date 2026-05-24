import { Injectable, signal } from '@angular/core';
import { CartItem, Customer, Order, OrderStatus, PaymentMethod, DeliveryMethod } from '../models';

export interface CheckoutData {
  customer: Customer;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
}

// Mock orders for admin panel
const MOCK_ORDERS: Order[] = [
  {
    id: 'o-1',
    orderNumber: 'CAP-001',
    customer: {
      fullName: 'María González',
      email: 'maria@email.com',
      phone: '1123456789',
      customerType: 'retail',
      address: 'Av. Corrientes 1234',
      province: 'Buenos Aires',
      city: 'CABA',
      postalCode: '1043',
    },
    items: [],
    total: 8600,
    status: 'paid',
    paymentMethod: 'mercado_pago',
    deliveryMethod: 'home_delivery',
    notes: '',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'o-2',
    orderNumber: 'CAP-002',
    customer: {
      fullName: 'Peluquería El Rizo',
      email: 'elrizo@email.com',
      phone: '1198765432',
      customerType: 'salon',
      address: 'Av. Santa Fe 4567',
      province: 'Buenos Aires',
      city: 'CABA',
      postalCode: '1425',
    },
    items: [],
    total: 36000,
    status: 'preparing',
    paymentMethod: 'transfer',
    deliveryMethod: 'pickup',
    notes: 'Coordinar retiro el jueves',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'o-3',
    orderNumber: 'CAP-003',
    customer: {
      fullName: 'Distribuidora Capilar Sur',
      email: 'sur@distribuidora.com',
      phone: '1167891234',
      customerType: 'wholesale',
      address: 'Av. Rivadavia 8900',
      province: 'Buenos Aires',
      city: 'Lanús',
      postalCode: '1824',
    },
    items: [],
    total: 68000,
    status: 'pending_payment',
    paymentMethod: 'transfer',
    deliveryMethod: 'whatsapp',
    notes: '',
    createdAt: new Date().toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class OrderService {
  private _orders = signal<Order[]>(MOCK_ORDERS);
  private _orderCounter = signal(MOCK_ORDERS.length + 1);

  // Replace with HTTP POST when backend is ready
  createOrder(data: CheckoutData, items: CartItem[]): Order {
    const number = String(this._orderCounter()).padStart(3, '0');
    const order: Order = {
      id: `o-${Date.now()}`,
      orderNumber: `CAP-${number}`,
      customer: data.customer,
      items: [...items],
      total: items.reduce((acc, i) => acc + i.subtotal, 0),
      status: 'created',
      paymentMethod: data.paymentMethod,
      deliveryMethod: data.deliveryMethod,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    this._orders.update((orders) => [order, ...orders]);
    this._orderCounter.update((n) => n + 1);
    return order;
  }

  // Replace with HTTP GET when backend is ready
  getOrders(): Order[] {
    return this._orders();
  }

  getOrderById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  // Replace with HTTP PATCH when backend is ready
  updateOrderStatus(id: string, status: OrderStatus): void {
    this._orders.update((orders) =>
      orders.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }
}
