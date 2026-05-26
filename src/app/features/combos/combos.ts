import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { inject } from '@angular/core';

interface Combo {
  id: string;
  icon: string;
  tag: string;
  tagColor: string;
  title: string;
  description: string;
  items: string[];
  highlight?: string;
}

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './combos.html',
  styleUrl: './combos.scss',
})
export class CombosComponent {
  private wa = inject(WhatsAppService);

  combos: Combo[] = [
    {
      id: 'cuidado-personal',
      icon: '🧴',
      tag: 'Particular',
      tagColor: 'primary',
      title: 'Combo Cuidado Personal',
      description: 'Todo lo que tu cabello necesita en un solo pack. Ideal para el uso diario en casa.',
      items: ['Shampoo nutritivo x 1', 'Acondicionador hidratante x 1', 'Máscara capilar x 1', 'Aceite reparador x 1'],
      highlight: 'El más elegido por particulares',
    },
    {
      id: 'tratamiento-capilar',
      icon: '💆',
      tag: 'Particular',
      tagColor: 'primary',
      title: 'Combo Tratamiento Capilar',
      description: 'Tratamiento intensivo para cabello dañado, seco o con frizz. Resultados visibles desde la primera semana.',
      items: ['Shampoo reparador x 1', 'Máscara nutritiva intensiva x 1', 'Sérum capilar x 1', 'Ampolla de tratamiento x 2'],
    },
    {
      id: 'peluqueria-inicial',
      icon: '✂',
      tag: 'Peluquería',
      tagColor: 'salon',
      title: 'Combo Peluquería Inicial',
      description: 'Pack de inicio para tu salón. Productos profesionales al mejor precio para arrancar con todo.',
      items: ['Shampoo profesional x 2', 'Acondicionador profesional x 2', 'Máscara capilar x 1', 'Tratamiento nutritivo x 1'],
      highlight: 'Perfecto para empezar',
    },
    {
      id: 'combo-salon-completo',
      icon: '💎',
      tag: 'Peluquería',
      tagColor: 'salon',
      title: 'Combo Salón Completo',
      description: 'Stock completo para un mes de trabajo en tu peluquería. Sin quedarte sin productos en el momento clave.',
      items: ['Shampoo profesional x 4', 'Acondicionador x 4', 'Máscaras capilares x 2', 'Aceites y sérums x 2', 'Tratamientos x 2'],
    },
    {
      id: 'revendedor',
      icon: '📦',
      tag: 'Mayorista',
      tagColor: 'wholesale',
      title: 'Combo Revendedor',
      description: 'Ideal para empezar a revender. Productos de alta rotación con margen garantizado.',
      items: ['Shampoo x 6 unidades', 'Acondicionador x 6 unidades', 'Máscara capilar x 3 unidades'],
      highlight: 'Mejor margen de reventa',
    },
    {
      id: 'mayorista-premium',
      icon: '🏭',
      tag: 'Mayorista',
      tagColor: 'wholesale',
      title: 'Combo Mayorista Premium',
      description: 'Caja completa para distribuidores o revendedores con volumen alto. Precio por unidad más bajo.',
      items: ['Shampoo x 12 unidades', 'Máscara nutritiva x 6 unidades', 'Aceite reparador x 4 unidades', 'Sérum capilar x 4 unidades'],
    },
  ];

  openWhatsApp(comboTitle: string): void {
    this.wa.openWhatsApp(`Hola, quiero consultar por el ${comboTitle} de Capilar Shopping.`);
  }
}
