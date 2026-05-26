import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { CurrencyArPipe } from '../../pipes/currency-ar.pipe';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [RouterLink, CurrencyArPipe],
  template: `
    @if (svc.toast().visible) {
      <div class="toast" role="status" aria-live="polite">
        <button class="toast__close" (click)="svc.dismiss()" aria-label="Cerrar">✕</button>

        <div class="toast__body">
          @if (svc.toast().imageUrl) {
            <img class="toast__img" [src]="svc.toast().imageUrl" alt="" />
          } @else {
            <div class="toast__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          }

          <div class="toast__content">
            <p class="toast__label">
              @if (svc.toast().isUpdate) { Cantidad actualizada } @else { ¡Agregado al carrito! }
            </p>
            <p class="toast__message">{{ svc.toast().message }}</p>
            @if (svc.toast().quantity !== undefined) {
              <p class="toast__meta">
                Cant: <strong>{{ svc.toast().quantity }}</strong>
                @if (svc.toast().subtotal !== undefined) {
                  &nbsp;·&nbsp;{{ svc.toast().subtotal ?? 0 | currencyAr }}
                }
              </p>
            }
          </div>
        </div>

        <a class="toast__action" routerLink="/carrito" (click)="svc.dismiss()">
          Ver carrito →
        </a>

        <div class="toast__progress">
          <div class="toast__progress-bar" [style.animation-duration]="(svc.toast().duration ?? 3200) + 'ms'"></div>
        </div>
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed;
      bottom: 5.5rem;
      right: 1.75rem;
      z-index: 500;
      background: var(--clr-ink);
      color: var(--clr-white);
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      box-shadow: var(--shadow-lg);
      max-width: 320px;
      width: 320px;
      overflow: hidden;
      animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .toast__close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 0.75rem;
      cursor: pointer;
      line-height: 1;
      padding: 0.2rem 0.3rem;
      border-radius: 3px;
      &:hover { color: var(--clr-white); background: rgba(255,255,255,0.1); }
    }

    .toast__body {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 2rem 0.9rem 0.9rem;
    }

    .toast__img {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
      border: 1px solid rgba(255,255,255,0.1);
    }

    .toast__icon {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.08);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--clr-primary-light);
    }

    .toast__content {
      flex: 1;
      min-width: 0;
    }

    .toast__label {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--clr-primary-light);
      margin: 0 0 0.15rem;
    }

    .toast__message {
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0 0 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toast__meta {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.65);
      margin: 0;
    }

    .toast__action {
      display: block;
      text-align: center;
      padding: 0.5rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--clr-primary-light);
      border-top: 1px solid rgba(255,255,255,0.1);
      text-decoration: none;
      &:hover { background: rgba(255,255,255,0.06); }
    }

    .toast__progress {
      height: 3px;
      background: rgba(255,255,255,0.1);
    }

    .toast__progress-bar {
      height: 100%;
      background: var(--clr-primary-light);
      animation: progress-shrink linear forwards;
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(20px) scale(0.94); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes progress-shrink {
      from { width: 100%; }
      to   { width: 0%; }
    }

    @media (max-width: 480px) {
      .toast {
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        max-width: none;
        bottom: 1.5rem;
      }
    }
  `],
})
export class ToastComponent {
  svc = inject(ToastService);
}
