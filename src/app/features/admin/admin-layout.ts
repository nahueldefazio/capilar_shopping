import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="admin-wrap">
      <aside class="admin-sidebar">
        <div class="admin-sidebar__brand">
          <span>✂</span>
          <strong>Admin Panel</strong>
        </div>
        <nav class="admin-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">📊 Dashboard</a>
          <a routerLink="/admin/productos" routerLinkActive="active">📦 Productos</a>
          <a routerLink="/admin/pedidos" routerLinkActive="active">🛒 Pedidos</a>
        </nav>
        <a class="admin-sidebar__back" routerLink="/">← Volver al sitio</a>
        <button class="admin-sidebar__logout" (click)="auth.logout()">Cerrar sesión</button>
      </aside>
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .admin-wrap {
      display: flex;
      min-height: 100vh;
      background: #f5f0eb;
    }

    .admin-sidebar {
      width: 220px;
      background: #2c1810;
      color: #e8d5c4;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 0;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;

      &__brand {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 1.25rem 1.5rem;
        border-bottom: 1px solid #3d2418;
        font-size: 0.95rem;
        color: #fff;
      }

      &__back {
        margin-top: auto;
        padding: 1rem 1.25rem;
        font-size: 0.8rem;
        color: #a08070;
        text-decoration: none;
        border-top: 1px solid #3d2418;
        transition: color 0.15s;

        &:hover { color: #e8d5c4; }
      }

      &__logout {
        padding: 0.75rem 1.25rem;
        font-size: 0.8rem;
        color: #a08070;
        background: none;
        border: none;
        border-top: 1px solid #3d2418;
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: color 0.15s;

        &:hover { color: #e8d5c4; }
      }
    }

    .admin-nav {
      display: flex;
      flex-direction: column;
      padding: 1rem 0.75rem;
      gap: 0.25rem;

      a {
        display: block;
        padding: 0.625rem 0.75rem;
        border-radius: 8px;
        text-decoration: none;
        color: #b8a898;
        font-size: 0.875rem;
        transition: background 0.15s, color 0.15s;

        &:hover { background: #3d2418; color: #e8d5c4; }
        &.active { background: #8b4513; color: #fff; }
      }
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .admin-wrap { flex-direction: column; }

      .admin-sidebar {
        width: 100%;
        height: auto;
        position: static;
        padding: 0.75rem 0;

        &__brand { padding: 0.5rem 1rem 0.75rem; font-size: 0.875rem; }
        &__back  { display: none; }
        &__logout { padding: 0.5rem 1rem; }
      }

      .admin-nav {
        flex-direction: row;
        flex-wrap: wrap;
        padding: 0.5rem;
        gap: 0.375rem;

        a { font-size: 0.8rem; padding: 0.5rem 0.625rem; }
      }

      .admin-content { padding: 1rem; }
    }

    @media (max-width: 480px) {
      .admin-content { padding: 0.875rem 0.75rem; }
    }
  `],
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
}
