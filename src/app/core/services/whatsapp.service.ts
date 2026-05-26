import { Injectable } from '@angular/core';
import { Order, Product } from '../models';

// Replace WHATSAPP_NUMBER with your actual number (with country code, no +)
const WHATSAPP_NUMBER = '5491100000000';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  buildProductMessage(product: Product): string {
    return `Hola! Me interesa el producto *${product.name}* (Precio: $${product.price.toLocaleString('es-AR')}). ¿Podés darme más información?`;
  }

  buildOrderMessage(order: Order): string {
    const itemsList = order.items
      .map((i) => `• ${i.productName} x${i.quantity} — $${i.subtotal.toLocaleString('es-AR')}`)
      .join('\n');
    return (
      `Hola! Acabo de hacer un pedido.\n\n` +
      `*Pedido:* ${order.orderNumber}\n` +
      `*Total:* $${order.total.toLocaleString('es-AR')}\n\n` +
      `*Productos:*\n${itemsList}\n\n` +
      `¿Cómo seguimos?`
    );
  }

  buildContactMessage(): string {
    return `Hola! Quiero consultar sobre los productos de Capilar Shopping.`;
  }

  buildWholesaleMessage(): string {
    return `Hola! Me interesa conocer las opciones de venta mayorista de Capilar Shopping.`;
  }

  openWhatsApp(message: string): void {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  }
}
