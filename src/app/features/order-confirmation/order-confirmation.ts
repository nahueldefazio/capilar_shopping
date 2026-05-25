import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Order } from '../../core/models';
import { CurrencyArPipe } from '../../shared/pipes/currency-ar.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private whatsapp = inject(WhatsAppService);

  order = signal<Order | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.orderService.getOrderById(id).subscribe({
      next: (order) => this.order.set(order),
    });
  }

  sendWhatsApp(): void {
    const order = this.order();
    if (!order) return;
    this.whatsapp.openWhatsApp(this.whatsapp.buildOrderMessage(order));
  }
}
