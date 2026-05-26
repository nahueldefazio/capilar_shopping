import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  visible: boolean;
  imageUrl?: string;
  quantity?: number;
  subtotal?: number;
  isUpdate?: boolean;
  duration?: number;
}

export interface ToastOptions {
  imageUrl?: string;
  quantity?: number;
  subtotal?: number;
  isUpdate?: boolean;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<Toast>({ message: '', visible: false });

  private _timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, options?: ToastOptions): void {
    const duration = options?.duration ?? 3200;
    if (this._timer) clearTimeout(this._timer);
    this.toast.set({ message, visible: true, ...options });
    this._timer = setTimeout(() => {
      this.toast.set({ message: '', visible: false });
    }, duration);
  }

  dismiss(): void {
    if (this._timer) clearTimeout(this._timer);
    this.toast.set({ message: '', visible: false });
  }
}
