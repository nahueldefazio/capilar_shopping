import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading" [class.loading--full]="fullPage">
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
      padding: 2rem;

      &--full {
        min-height: 50vh;
      }

      &__spinner {
        width: 36px;
        height: 36px;
        border: 3px solid #e8e0d8;
        border-top-color: #8b4513;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      &__text {
        color: #8a7060;
        font-size: 0.875rem;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {
  @Input() text = '';
  @Input() fullPage = false;
}
