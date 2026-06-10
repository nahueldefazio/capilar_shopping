import { Component, inject, signal, ElementRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subject, debounceTime, takeUntil, merge } from 'rxjs';
import { CartStore } from '../../core/services/cart.store';
import { ShippingService } from '../../core/services/shipping.service';
import { Customer, ShippingCalculationResult } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;
const CITY_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .'-]{2,80}$/;
const STREET_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .'-]{2,100}$/;
const POSTAL_CODE_PATTERN = /^[A-Za-z0-9]{4,8}$/;
const STREET_NUMBER_PATTERN = /^[1-9][0-9]{0,5}[A-Za-z]?$/;
const APARTMENT_PATTERN = /^[A-Za-z0-9 .°º/-]{0,30}$/;

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
  private shippingService = inject(ShippingService);
  private router = inject(Router);
  private el = inject(ElementRef);
  private destroy$ = new Subject<void>();

  cartStore_ = this.cartStore;
  submitting = signal(false);
  errorMsg = signal('');
  calculatingShipping = signal(false);
  shippingResult = signal<ShippingCalculationResult | null>(null);

  form = this.fb.group({
    fullName: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(80),
      this.noWhitespaceValidator,
      Validators.pattern(NAME_PATTERN),
    ]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    phone: ['', [Validators.required, this.phoneValidator]],
    customerType: ['retail' as Customer['customerType'], Validators.required],
    province: ['', Validators.required],
    city: [''],
    postalCode: [''],
    street: [''],
    streetNumber: [''],
    apartment: ['', [Validators.maxLength(30), Validators.pattern(APARTMENT_PATTERN)]],
    deliveryMethod: ['home_delivery', Validators.required],
    paymentMethod: ['mercadopago', Validators.required],
    notes: ['', Validators.maxLength(500)],
  });

  constructor() {
    this.syncAddressValidators(this.form.get('deliveryMethod')!.value);

    this.form
      .get('deliveryMethod')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((method) => {
        this.syncAddressValidators(method);
        this.recalculateShipping();
      });

    merge(
      this.form.get('province')!.valueChanges,
      this.form.get('city')!.valueChanges,
      this.form.get('postalCode')!.valueChanges,
    )
      .pipe(debounceTime(500), takeUntil(this.destroy$))
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

  get showZoneSelector(): boolean {
    const method = this.form.get('deliveryMethod')?.value;
    return method === 'home_delivery' || method === 'pickup';
  }

  get shippingDisplay(): { cost: number | null; message: string | null } {
    const method = this.form.get('deliveryMethod')?.value;
    if (method === 'coordinate_by_whatsapp') {
      return { cost: null, message: 'a coordinar' };
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
    if (method !== 'home_delivery' && method !== 'pickup') {
      this.shippingResult.set(null);
      return;
    }
    const province = this.form.get('province')?.value;
    const city = this.form.get('city')?.value;
    if (!province || !city) return;

    this.calculatingShipping.set(true);
    this.shippingService
      .calculate({
        province,
        city,
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

  private syncAddressValidators(method: string | null): void {
    const isHomeDelivery = method === 'home_delivery';
    const needsZone = isHomeDelivery || method === 'pickup';

    const validatorsByField = {
      province: [Validators.required],
      city: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(80),
        this.noWhitespaceValidator,
        Validators.pattern(CITY_PATTERN),
      ],
      postalCode: [
        Validators.required,
        Validators.pattern(POSTAL_CODE_PATTERN),
      ],
      street: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.noWhitespaceValidator,
        Validators.pattern(STREET_PATTERN),
      ],
      streetNumber: [
        Validators.required,
        Validators.pattern(STREET_NUMBER_PATTERN),
      ],
    };

    const zoneOnlyFields = new Set(['province', 'city']);

    for (const [field, validators] of Object.entries(validatorsByField)) {
      const control = this.form.get(field);
      if (!control) continue;
      const active = zoneOnlyFields.has(field) ? needsZone : isHomeDelivery;
      control.setValidators(active ? validators : []);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    this.trimFormValues();

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
    this.router.navigate(['/revisar-pedido'], {
      state: {
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        customerType: v.customerType,
        province: v.province ?? '',
        city: v.city ?? '',
        postalCode: v.postalCode ?? '',
        street: v.street ?? '',
        streetNumber: v.streetNumber ?? '',
        apartment: v.apartment ?? '',
        deliveryMethod: v.deliveryMethod,
        paymentMethod: v.paymentMethod,
        notes: v.notes ?? '',
        shippingResult: this.shippingResult(),
      },
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control?.errors) return '';

    if (control.errors['required'] || control.errors['whitespace']) return 'Este dato es obligatorio';
    if (control.errors['email']) return 'Ingresá un email válido';
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    if (control.errors['invalidPhone']) return 'Ingresá un teléfono válido, con código de área';

    const patternMessages: Record<string, string> = {
      fullName: 'Ingresá nombre y apellido, solo con letras',
      city: 'Ingresá una localidad válida',
      postalCode: 'Ingresá un código postal válido',
      street: 'Ingresá una calle válida',
      streetNumber: 'Ingresá un número válido',
      apartment: 'Ingresá un piso/depto válido',
    };

    return patternMessages[field] ?? 'Revisá este dato';
  }

  private trimFormValues(): void {
    const nextValue = Object.fromEntries(
      Object.entries(this.form.value).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
      ]),
    );
    this.form.patchValue(nextValue, { emitEvent: false });
  }

  private noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '');
    return value.trim().length === 0 ? { whitespace: true } : null;
  }

  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    if (!/^\+?[\d\s().-]+$/.test(value)) return { invalidPhone: true };

    const digits = value.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 15) return { invalidPhone: true };
    if (/^(\d)\1+$/.test(digits)) return { invalidPhone: true };

    return null;
  }
}
