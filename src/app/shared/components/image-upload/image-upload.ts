import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  template: `
    <div class="img-upload">
      <!-- Preview -->
      <div class="img-upload__preview" [class.img-upload__preview--empty]="!currentUrl()">
        @if (currentUrl()) {
          <img [src]="currentUrl()" alt="Imagen del producto" class="img-upload__img" />
          <button class="img-upload__remove" (click)="remove()" type="button" title="Eliminar imagen">✕</button>
        } @else {
          <div class="img-upload__placeholder">
            <span class="img-upload__placeholder-icon">🖼️</span>
            <span class="img-upload__placeholder-text">Sin imagen</span>
          </div>
        }
      </div>

      <!-- Botón -->
      <div class="img-upload__controls">
        <label class="img-upload__btn" [class.img-upload__btn--loading]="uploading()">
          @if (uploading()) {
            <span class="img-upload__spinner"></span>
            Subiendo...
          } @else {
            📁 {{ currentUrl() ? 'Cambiar imagen' : 'Subir imagen' }}
          }
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            (change)="onFileSelected($event)"
            [disabled]="uploading()"
            style="display:none"
          />
        </label>

        @if (error()) {
          <p class="img-upload__error">{{ error() }}</p>
        }
        <p class="img-upload__hint">JPG, PNG o WebP — máximo 5 MB</p>
      </div>
    </div>
  `,
  styles: [`
    .img-upload {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;

      &__preview {
        width: 120px;
        height: 120px;
        border-radius: 12px;
        border: 2px dashed var(--clr-border, #E8D5CC);
        overflow: hidden;
        position: relative;
        flex-shrink: 0;
        background: var(--clr-primary-xlight, #FBF2EE);
        transition: border-color 0.2s;

        &--empty { display: flex; align-items: center; justify-content: center; }
        &:hover { border-color: var(--clr-primary, #C4907A); }
      }

      &__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      &__remove {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 22px;
        height: 22px;
        background: rgba(26,16,16,0.7);
        color: #fff;
        border: none;
        border-radius: 50%;
        font-size: 0.65rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.15s;
      }

      &__preview:hover &__remove { opacity: 1; }

      &__placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        text-align: center;
        padding: 0.5rem;

        &-icon { font-size: 1.75rem; }
        &-text { font-size: 0.68rem; color: var(--clr-ink-soft, #8A7068); }
      }

      &__controls {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }

      &__btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 1rem;
        background: var(--clr-primary-xlight, #FBF2EE);
        color: var(--clr-primary-dark, #A87060);
        border: 1.5px solid var(--clr-primary, #C4907A);
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
        font-family: var(--font-sans);
        width: fit-content;

        &:hover:not(&--loading) { background: var(--clr-primary-light, #F0DDD5); }
        &--loading { opacity: 0.7; cursor: not-allowed; }
      }

      &__spinner {
        width: 14px;
        height: 14px;
        border: 2px solid var(--clr-primary-light, #F0DDD5);
        border-top-color: var(--clr-primary, #C4907A);
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block;
      }

      &__error {
        font-size: 0.78rem;
        color: #dc2626;
        margin: 0;
      }

      &__hint {
        font-size: 0.72rem;
        color: var(--clr-ink-soft, #8A7068);
        margin: 0;
      }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class ImageUploadComponent {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  @Input() set imageUrl(val: string) { this._url.set(val ?? ''); }
  @Output() imageUrlChange = new EventEmitter<string>();

  private _url = signal('');
  uploading = signal(false);
  error = signal('');

  currentUrl = this._url.asReadonly();

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.error.set('');
    this.uploading.set(true);

    const form = new FormData();
    form.append('file', file);

    const token = this.auth.getToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();

    this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/image`, form, { headers })
      .subscribe({
        next: (res) => {
          this._url.set(res.url);
          this.imageUrlChange.emit(res.url);
          this.uploading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Error al subir la imagen. Intentá de nuevo.');
          this.uploading.set(false);
        },
      });
  }

  remove(): void {
    this._url.set('');
    this.imageUrlChange.emit('');
  }
}
