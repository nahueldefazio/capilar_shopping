import { Component, inject, signal } from '@angular/core';
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

  cartStore_ = this.cartStore;
  submitting = signal(false);

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
    paymentMethod: ['mercado_pago' as PaymentMethod, Validators.required],
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
      return;
    }
    if (this.cartStore.items().length === 0) return;

    this.submitting.set(true);

    // Simulate async operation — replace with HTTP call
    setTimeout(() => {
      const v = this.form.value;
      const order = this.orderService.createOrder(
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
      );

      this.cartStore.clearCart();
      this.submitting.set(false);
      this.router.navigate(['/confirmacion', order.id]);
    }, 1000);
  }
}
