import { Component, inject, signal, ElementRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, debounceTime, takeUntil, distinctUntilChanged, combineLatest } from 'rxjs';
import { CartStore } from '../../core/services/cart.store';
import { OrderService } from '../../core/services/order.service';
import { ShippingService } from '../../core/services/shipping.service';
import { Customer, ShippingCalculationResult } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyArPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private shippingService = inject(ShippingService);
  private router = inject(Router);
  private el = inject(ElementRef);
  private destroy$ = new Subject<void>();

  cartStore_ = this.cartStore;
  submitting = signal(false);
  redirectingToMP = signal(false);
  errorMsg = signal('');
  calculatingShipping = signal(false);
  shippingResult = signal<ShippingCalculationResult | null>(null);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    customerType: ['retail' as Customer['customerType'], Validators.required],
    province: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    street: ['', Validators.required],
    streetNumber: ['', Validators.required],
    apartment: [''],
    deliveryMethod: ['home_delivery', Validators.required],
    paymentMethod: ['mercadopago', Validators.required],
    notes: [''],
  });

  constructor() {
    combineLatest([
      this.form.get('deliveryMethod')!.valueChanges,
      this.form.get('province')!.valueChanges,
    ])
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.recalculateShipping());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() {
    return this.form.controls;
  }

  get showAddress(): boolean {
    return this.form.get('deliveryMethod')?.value === 'home_delivery';
  }

  get shippingDisplay(): { cost: number | null; message: string | null } {
    const method = this.form.get('deliveryMethod')?.value;
    if (method === 'pickup' || method === 'coordinate_by_whatsapp') {
      return { cost: 0, message: null };
    }
    const r = this.shippingResult();
    if (!r) return { cost: null, message: null };
    return { cost: r.shippingCost, message: r.message };
  }

  get grandTotal(): number {
    const sub = this.cartStore.total();
    const ship = this.shippingDisplay.cost ?? 0;
    return sub + ship;
  }

  private recalculateShipping(): void {
    const method = this.form.get('deliveryMethod')?.value;
    if (method !== 'home_delivery') {
      this.shippingResult.set(null);
      return;
    }
    const province = this.form.get('province')?.value;
    const city = this.form.get('city')?.value;
    const postalCode = this.form.get('postalCode')?.value;
    if (!province || !city || !postalCode) return;

    this.calculatingShipping.set(true);
    this.shippingService
      .calculate({
        province,
        city,
        postalCode,
        items: this.cartStore.items().map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        deliveryMethod: method,
      })
      .subscribe({
        next: (result) => {
          this.shippingResult.set(result);
          this.calculatingShipping.set(false);
        },
        error: () => this.calculatingShipping.set(false),
      });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => {
        const first = this.el.nativeElement.querySelector('.form-input.ng-invalid, .ng-invalid .form-input');
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.focus();
      });
      return;
    }
    if (this.cartStore.items().length === 0) return;

    const v = this.form.value;
    const isHomeDelivery = v.deliveryMethod === 'home_delivery';

    if (isHomeDelivery && this.shippingResult()?.message) {
      this.errorMsg.set('El envío supera los 5 kg. Coordiná la entrega por WhatsApp.');
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    const address = isHomeDelivery
      ? `${v.street} ${v.streetNumber}${v.apartment ? ', ' + v.apartment : ''}`
      : undefined;

    this.orderService.createOrder(
      {
        customer: {
          fullName: v.fullName!,
          email: v.email!,
          phone: v.phone!,
          customerType: v.customerType as Customer['customerType'],
          address,
          province: v.province!,
          city: v.city!,
          postalCode: v.postalCode!,
        },
        shipping: isHomeDelivery
          ? {
              province: v.province!,
              city: v.city!,
              postalCode: v.postalCode!,
              street: v.street!,
              streetNumber: v.streetNumber!,
              apartment: v.apartment ?? undefined,
            }
          : undefined,
        paymentMethod: v.paymentMethod!,
        deliveryMethod: v.deliveryMethod!,
        notes: v.notes ?? '',
      },
      this.cartStore.items()
    ).subscribe({
      next: (order) => {
        if (v.paymentMethod === 'mercadopago') {
          this.orderService.createMercadoPagoPreference(Number(order.id)).subscribe({
            next: ({ initPoint }) => {
              this.submitting.set(false);
              this.redirectingToMP.set(true);
              this.cartStore.clearCart();
              window.location.href = initPoint;
            },
            error: () => {
              this.submitting.set(false);
              this.errorMsg.set('No se pudo iniciar el pago. Intentá de nuevo.');
            },
          });
        } else {
          this.submitting.set(false);
          this.router.navigate(['/confirmacion', order.id], { state: { order } }).then(() => {
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
