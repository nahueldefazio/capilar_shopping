import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toast = signal<Toast>({ message: '', visible: false });

  private _timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, duration = 2800): void {
    if (this._timer) clearTimeout(this._timer);
    this.toast.set({ message, visible: true });
    this._timer = setTimeout(() => {
      this.toast.set({ message: '', visible: false });
    }, duration);
  }
}
