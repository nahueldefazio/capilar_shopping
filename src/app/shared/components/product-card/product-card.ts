import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { CurrencyArPipe } from '../../pipes/currency-ar.pipe';
import { BadgeComponent } from '../badge/badge';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe, BadgeComponent],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    this.addToCart.emit(this.product);
  }
}
