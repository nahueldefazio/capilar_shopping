import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading" [class.loading--full]="fullPage" [class.loading--inline]="inline">
      <div class="loading__spinner"></div>
      @if (text) {
        <p class="loading__text">{{ text }}</p>
      }
    </div>
  `,
  styles: [`
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 3rem 2rem;
      animation: fadeInUp 0.3s ease both;

      &--full { min-height: 55vh; }
      &--inline { padding: 1.5rem; }

      &__spinner {
        width: 40px;
        height: 40px;
        border: 3px solid var(--clr-primary-light, #F0DDD5);
        border-top-color: var(--clr-primary, #C4907A);
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }

      &__text {
        color: var(--clr-ink-soft, #8A7068);
        font-size: 0.875rem;
        font-family: var(--font-sans);
        font-weight: 500;
      }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class LoadingComponent {
  @Input() text = '';
  @Input() fullPage = false;
  @Input() inline = false;
}
