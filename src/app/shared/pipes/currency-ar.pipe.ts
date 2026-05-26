import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyAr', standalone: true })
export class CurrencyArPipe implements PipeTransform {
  transform(value: number): string {
    const rounded = Math.ceil(value);
    return '$ ' + rounded.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
}
