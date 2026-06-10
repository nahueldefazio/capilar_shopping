import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

type LegalPage = 'terms' | 'privacy' | 'returns' | 'withdrawal';

interface LegalContent {
  title: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
}

const CONTENT: Record<Exclude<LegalPage, 'withdrawal'>, LegalContent> = {
  terms: {
    title: 'Terminos y condiciones',
    intro: 'Condiciones generales para comprar en Capilar Shopping.',
    sections: [
      {
        title: 'Compras',
        body:
          'Los precios, productos y promociones publicados pueden modificarse sin aviso previo. La compra queda sujeta a disponibilidad de stock y confirmacion del pago.',
      },
      {
        title: 'Pagos',
        body:
          'Aceptamos Mercado Pago y transferencia bancaria. En compras por transferencia, el pedido se prepara luego de validar el comprobante.',
      },
      {
        title: 'Envios y retiro',
        body:
          'Los costos y plazos de envio dependen de la zona, peso del pedido y operador logistico. Tambien pueden coordinarse retiros o entregas por WhatsApp.',
      },
      {
        title: 'Contacto comercial',
        body:
          'Capilar Shopping. Para consultas, cambios de datos fiscales o soporte de pedidos, escribinos por WhatsApp o al email informado en la compra.',
      },
    ],
  },
  privacy: {
    title: 'Politica de privacidad',
    intro: 'Como usamos los datos necesarios para procesar tu compra.',
    sections: [
      {
        title: 'Datos recolectados',
        body:
          'Solicitamos nombre, email, telefono, datos de facturacion o envio y detalle del pedido para gestionar la compra.',
      },
      {
        title: 'Uso de la informacion',
        body:
          'Usamos tus datos para confirmar pedidos, coordinar pagos, preparar envios, responder consultas y cumplir obligaciones operativas o legales.',
      },
      {
        title: 'Conservacion',
        body:
          'La informacion se conserva mientras sea necesaria para la operacion comercial, soporte postventa y registros administrativos.',
      },
      {
        title: 'Derechos',
        body:
          'Podés solicitar acceso, correccion o eliminacion de tus datos escribiendo al canal de contacto de Capilar Shopping.',
      },
    ],
  },
  returns: {
    title: 'Cambios y devoluciones',
    intro: 'Politica operativa para resolver cambios, devoluciones y pedidos con problemas.',
    sections: [
      {
        title: 'Plazo',
        body:
          'Contactanos dentro de los 10 dias corridos desde la recepcion del pedido para revisar cambios o devoluciones.',
      },
      {
        title: 'Condicion del producto',
        body:
          'Los productos deben estar sin uso, cerrados y en su empaque original, salvo fallas o errores atribuibles al pedido.',
      },
      {
        title: 'Costos de envio',
        body:
          'Cuando corresponda una devolucion por arrepentimiento o error operativo, coordinamos el procedimiento y los costos aplicables por el canal de contacto.',
      },
      {
        title: 'Productos con falla',
        body:
          'Si recibiste un producto dañado o incorrecto, envianos fotos, numero de pedido y detalle del inconveniente.',
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
})
export class LegalPageComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  page = this.route.snapshot.data['page'] as LegalPage;
  submitting = signal(false);
  submittedCode = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    orderNumber: [''],
    message: [''],
  });

  get content(): LegalContent | null {
    if (this.page === 'withdrawal') return null;
    return CONTENT[this.page];
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  submitWithdrawal(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');
    this.http
      .post<{ code: string }>(`${environment.apiUrl}/legal/arrepentimiento`, this.form.value)
      .subscribe({
        next: ({ code }) => {
          this.submitting.set(false);
          this.submittedCode.set(code);
          this.form.reset();
        },
        error: () => {
          this.submitting.set(false);
          this.errorMsg.set('No pudimos registrar la solicitud. Escribinos por WhatsApp para resolverlo.');
        },
      });
  }
}
