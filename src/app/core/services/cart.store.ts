import { Injectable, computed, signal, inject } from '@angular/core';
import { CartItem, Product } from '../models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly STORAGE_KEY = 'capilar_cart';
  private toast = inject(ToastService);

  readonly items = signal<CartItem[]>(this._loadFromStorage());

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly total = computed(() =>
    this.items().reduce((acc, item) => acc + item.subtotal, 0)
  );

  addItem(product: Product, quantity: number = 1): void {
    this.items.update((current) => {
      const existing = current.find((i) => i.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        const newQty = existing.quantity + quantity;
        updated = current.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: newQty, subtotal: newQty * product.price }
            : i
        );
        this.toast.show(product.name, {
          imageUrl: product.imageUrl,
          quantity: newQty,
          subtotal: newQty * product.price,
          isUpdate: true,
        });
      } else {
        updated = [...current, { product, quantity, subtotal: quantity * product.price }];
        this.toast.show(product.name, {
          imageUrl: product.imageUrl,
          quantity,
          subtotal: quantity * product.price,
          isUpdate: false,
        });
      }
      this._saveToStorage(updated);
      return updated;
    });
  }

  removeItem(productId: string): void {
    this.items.update((current) => {
      const updated = current.filter((i) => i.product.id !== productId);
      this._saveToStorage(updated);
      return updated;
    });
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.items.update((current) => {
      const updated = current.map((i) =>
        i.product.id === productId
          ? { ...i, quantity, subtotal: quantity * i.product.price }
          : i
      );
      this._saveToStorage(updated);
      return updated;
    });
  }

  clearCart(): void {
    this.items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private _saveToStorage(items: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage may be unavailable in SSR
    }
  }

  private _loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
