import { Component, Input } from '@angular/core';
import { SaleType } from '../../../core/models';

const SALE_TYPE_LABELS: Record<SaleType, string> = {
  retail: 'Particular',
  salon: 'Peluquería',
  wholesale: 'Mayorista',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge badge--{{ variant }}">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;

      &--retail    { background: var(--clr-primary-xlight); color: var(--clr-primary-dark); }
      &--salon     { background: rgba(94, 68, 168, 0.10); color: #4a2ea0; }
      &--wholesale { background: rgba(26, 16, 16, 0.07); color: var(--clr-ink-mid); }
      &--featured  { background: #fff3cd; color: #856404; }
    }
  `],
})
export class BadgeComponent {
  @Input() saleType?: SaleType;
  @Input() variant: SaleType | 'featured' = 'retail';
  @Input() customLabel?: string;

  get label(): string {
    if (this.customLabel) return this.customLabel;
    if (this.saleType) return SALE_TYPE_LABELS[this.saleType];
    return SALE_TYPE_LABELS[this.variant as SaleType] ?? '';
  }
}
