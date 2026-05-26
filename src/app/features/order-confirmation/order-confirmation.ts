import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Order } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';
import { LoadingComponent } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe, LoadingComponent],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private whatsapp = inject(WhatsAppService);

  order = signal<Order | null>(null);
  loading = signal(false);

  ngOnInit(): void {
    const stateOrder: Order | undefined = history.state?.order;
    if (stateOrder) {
      this.order.set(stateOrder);
      return;
    }
    this.loading.set(true);
    const id = this.route.snapshot.params['id'];
    this.orderService.getOrderById(id).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  sendWhatsApp(): void {
    const order = this.order();
    if (!order) return;
    this.whatsapp.openWhatsApp(this.whatsapp.buildOrderMessage(order));
  }
}
