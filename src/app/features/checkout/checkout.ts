import { Component, inject, signal, ElementRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CartStore } from '../../core/services/cart.store';
import { OrderService } from '../../core/services/order.service';
import { Customer, PaymentMethod, DeliveryMethod } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyArPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent {
  private fb = inject(FormBuilder);
  private cartStore = inject(CartStore);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private el = inject(ElementRef);

  cartStore_ = this.cartStore;
  submitting = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    customerType: ['retail' as Customer['customerType'], Validators.required],
    address: ['', Validators.required],
    province: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    deliveryMethod: ['home_delivery' as DeliveryMethod, Validators.required],
    paymentMethod: ['mercadopago' as PaymentMethod, Validators.required],
    notes: [''],
  });

  get f() {
    return this.form.controls;
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

    this.submitting.set(true);
    this.errorMsg.set('');

    const v = this.form.value;
    this.orderService.createOrder(
      {
        customer: {
          fullName: v.fullName!,
          email: v.email!,
          phone: v.phone!,
          customerType: v.customerType as Customer['customerType'],
          address: v.address!,
          province: v.province!,
          city: v.city!,
          postalCode: v.postalCode!,
        },
        paymentMethod: v.paymentMethod as PaymentMethod,
        deliveryMethod: v.deliveryMethod as DeliveryMethod,
        notes: v.notes ?? '',
      },
      this.cartStore.items()
    ).subscribe({
      next: (order) => {
        if (v.paymentMethod === 'mercadopago') {
          // Crear preferencia y redirigir a Mercado Pago
          this.orderService.createMercadoPagoPreference(Number(order.id)).subscribe({
            next: ({ initPoint }) => {
              this.submitting.set(false);
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
