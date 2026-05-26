import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';

import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private whatsapp = inject(WhatsAppService);

  loading = this.productService.loading;

  featuredProducts = computed(() =>
    this.productService.products().filter((p) => p.isActive && p.featured).slice(0, 4)
  );

  ngOnInit(): void {
    this.productService.load();
  }

  openWhatsAppContact(): void {
    this.whatsapp.openWhatsApp(this.whatsapp.buildContactMessage());
  }

  openWhatsAppWholesale(): void {
    this.whatsapp.openWhatsApp(this.whatsapp.buildWholesaleMessage());
  }
}
