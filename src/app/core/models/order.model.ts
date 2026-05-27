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
export type DeliveryMethod = 'pickup' | 'home_delivery' | 'coordinate_by_whatsapp';
export type ShippingZone = 'CABA' | 'GBA' | 'INTERIOR' | 'A_COORDINAR';
export type ShippingStatus =
  | 'pending'
  | 'preparing'
  | 'label_created'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderShipping {
  id: string;
  status: ShippingStatus;
  province: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  apartment?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

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
  shipping?: OrderShipping;
  subtotal: number;
  shippingCost: number;
  shippingZone?: ShippingZone;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  notes: string;
  createdAt: string;
}

export interface ShippingCalculationResult {
  shippingMethod: string;
  zone: ShippingZone | null;
  totalWeightGrams: number;
  shippingCost: number | null;
  message: string | null;
}
