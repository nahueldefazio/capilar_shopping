import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartStore } from '../../core/services/cart.store';

type ResultStatus = 'approved' | 'rejected' | 'pending' | 'unknown';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './payment-result.html',
  styleUrl: './payment-result.scss',
})
export class PaymentResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cartStore = inject(CartStore);

  status = signal<ResultStatus>('unknown');
  orderNumber = signal('');
  paymentId = signal('');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const collectionStatus = params.get('collection_status') ?? params.get('status') ?? '';
    const externalRef = params.get('external_reference') ?? '';
    const mpPaymentId = params.get('collection_id') ?? params.get('payment_id') ?? '';

    this.orderNumber.set(externalRef);
    this.paymentId.set(mpPaymentId);

    if (collectionStatus === 'approved') {
      this.status.set('approved');
      this.cartStore.clearCart();
    } else if (collectionStatus === 'rejected' || collectionStatus === 'cancelled') {
      this.status.set('rejected');
    } else if (collectionStatus === 'pending' || collectionStatus === 'in_process') {
      this.status.set('pending');
    } else {
      this.status.set('unknown');
    }
  }
}
