import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = environment.apiUrl;

  private _token = signal<string | null>(localStorage.getItem('admin_token'));

  isLoggedIn = this._token.asReadonly();

  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.base}/auth/login`, { username, password }).pipe(
      tap(({ access_token }) => {
        localStorage.setItem('admin_token', access_token);
        this._token.set(access_token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    this._token.set(null);
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
