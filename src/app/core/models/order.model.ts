import { CartItem } from './cart.model';
import { Customer } from './customer.model';

export type OrderStatus =
  | 'created'
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';
export type PaymentMethod = 'mercadopago' | 'transfer';
export type DeliveryMethod = 'pickup' | 'home_delivery' | 'whatsapp';

export interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
  createdAt: string;
}
