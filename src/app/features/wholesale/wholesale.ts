import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/services/cart.store';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card';
import { LoadingComponent } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-wholesale',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, LoadingComponent],
  templateUrl: './wholesale.html',
  styleUrl: './wholesale.scss',
})
export class WholesaleComponent {
  private productService = inject(ProductService);
  private cartStore = inject(CartStore);
  private wa = inject(WhatsAppService);

  loading = this.productService.loading;
  wholesaleProducts = computed(() =>
    this.productService.products()
      .filter(p => p.isActive && p.saleType === 'wholesale')
      .slice(0, 8)
  );

  ngOnInit(): void {
    this.productService.load();
  }

  addToCart(product: Product): void {
    this.cartStore.addItem(product, 1);
  }

  openWhatsApp(): void {
    this.wa.openWhatsApp('Hola, quiero consultar condiciones mayoristas y hacer un pedido grande en Capilar Shopping.');
  }
}
