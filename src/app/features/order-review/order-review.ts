import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CartStore } from '../../core/services/cart.store';
import { OrderService } from '../../core/services/order.service';
import { Customer, ShippingCalculationResult } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

export interface OrderReviewState {
  fullName: string;
  email: string;
  phone: string;
  customerType: Customer['customerType'];
  province: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  apartment: string;
  deliveryMethod: string;
  paymentMethod: string;
  notes: string;
  shippingResult: ShippingCalculationResult | null;
}

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [CurrencyArPipe],
  templateUrl: './order-review.html',
  styleUrl: './order-review.scss',
})
export class OrderReviewComponent implements OnInit {
  private cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private location = inject(Location);

  cartStore_ = this.cartStore;
  submitting = signal(false);
  redirectingToMP = signal(false);
  errorMsg = signal('');
  state: OrderReviewState | null = null;

  readonly deliveryLabels: Record<string, string> = {
    home_delivery: '🚚 Envío a domicilio (Andreani)',
    pickup: '📦 Retiro en sucursal Andreani',
    coordinate_by_whatsapp: '💬 Coordinar por WhatsApp',
  };

  readonly paymentLabels: Record<string, string> = {
    mercadopago: '💳 Mercado Pago',
    transfer: '🏦 Transferencia bancaria',
  };

  readonly customerTypeLabels: Record<string, string> = {
    retail: 'Particular',
    salon: 'Peluquería',
    wholesale: 'Mayorista',
  };

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const s = nav?.extras?.state ?? (window.history.state as OrderReviewState);
    if (!s?.fullName) {
      this.router.navigate(['/checkout']);
      return;
    }
    this.state = s as OrderReviewState;
  }

  get shippingDisplay(): { cost: number | null; label: string | null; warn: string | null } {
    const s = this.state;
    if (!s) return { cost: null, label: '—', warn: null };
    if (s.deliveryMethod === 'coordinate_by_whatsapp') {
      return { cost: null, label: 'a coordinar', warn: null };
    }
    if (s.deliveryMethod === 'home_delivery' || s.deliveryMethod === 'pickup') {
      if (!s.shippingResult) return { cost: null, label: '—', warn: null };
      if (s.shippingResult.message) return { cost: null, label: 'a coordinar', warn: s.shippingResult.message };
      return { cost: s.shippingResult.shippingCost, label: null, warn: null };
    }
    return { cost: null, label: '—', warn: null };
  }

  get grandTotal(): number {
    return this.cartStore.total() + (this.shippingDisplay.cost ?? 0);
  }

  get addressLine(): string {
    const s = this.state!;
    let addr = `${s.street} ${s.streetNumber}`;
    if (s.apartment) addr += `, ${s.apartment}`;
    addr += `, ${s.city}, ${s.province} (CP ${s.postalCode})`;
    return addr;
  }

  goBack(): void {
    this.location.back();
  }

  onConfirm(): void {
    const s = this.state!;
    if (this.cartStore.items().length === 0) return;

    this.submitting.set(true);
    this.errorMsg.set('');

    const isHomeDelivery = s.deliveryMethod === 'home_delivery';
    const address = isHomeDelivery
      ? `${s.street} ${s.streetNumber}${s.apartment ? ', ' + s.apartment : ''}`
      : undefined;

    this.orderService.createOrder(
      {
        customer: {
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          customerType: s.customerType,
          address,
          province: s.province,
          city: s.city,
          postalCode: s.postalCode,
        },
        shipping: isHomeDelivery
          ? {
              province: s.province,
              city: s.city,
              postalCode: s.postalCode,
              street: s.street,
              streetNumber: s.streetNumber,
              apartment: s.apartment || undefined,
            }
          : undefined,
        paymentMethod: s.paymentMethod,
        deliveryMethod: s.deliveryMethod,
        notes: s.notes ?? '',
      },
      this.cartStore.items()
    ).subscribe({
      next: (order) => {
        const publicToken = order.publicToken ?? '';
        if (s.paymentMethod === 'mercadopago') {
          this.orderService.createMercadoPagoPreference(Number(order.id)).subscribe({
            next: ({ initPoint }) => {
              this.submitting.set(false);
              this.redirectingToMP.set(true);
              if (publicToken) sessionStorage.setItem(`order_token_${order.id}`, publicToken);
              this.cartStore.clearCart();
              window.location.href = initPoint;
            },
            error: () => {
              this.submitting.set(false);
              this.errorMsg.set('No se pudo iniciar el pago. Intentá de nuevo.');
            },
          });
        } else {
          if (publicToken) sessionStorage.setItem(`order_token_${order.id}`, publicToken);
          this.submitting.set(false);
          this.router
            .navigate(['/confirmacion', order.id], {
              queryParams: publicToken ? { token: publicToken } : undefined,
              state: { order },
            })
            .then(() => {
              this.cartStore.clearCart();
            });
        }
      },
      error: () => {
        this.submitting.set(false);
        this.errorMsg.set('Hubo un error al procesar tu pedido. Intentá de nuevo.');
      },
    });
  }
}
