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

export type PaymentMethod = 'mercado_pago' | 'transfer';
export type DeliveryMethod = 'pickup' | 'home_delivery' | 'whatsapp';

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
  createdAt: string;
}
