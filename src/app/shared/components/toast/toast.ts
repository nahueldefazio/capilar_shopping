import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @if (toast().visible) {
      <div class="toast" role="status" aria-live="polite">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span>{{ toast().message }}</span>
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 5.5rem;
      right: 1.75rem;
      z-index: 500;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--clr-ink);
      color: var(--clr-white);
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: var(--shadow-lg);
      max-width: 320px;
      animation: toast-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;

      svg { flex-shrink: 0; color: var(--clr-primary-light); }
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (max-width: 480px) {
      .toast {
        right: 1rem;
        left: 1rem;
        max-width: none;
        bottom: 1.5rem;
      }
    }
  `],
})
export class ToastComponent {
  toast = inject(ToastService).toast;
}
