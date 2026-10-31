import { formatCurrency } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';

/** 9200 -> "$9.200" (es-AR). Reemplaza el toLocaleString repetido de la maqueta. */
@Pipe({ name: 'precio' })
export class PrecioPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(valor: number | null | undefined): string {
    return formatCurrency(valor ?? 0, this.locale, '$', 'ARS', '1.0-0');
  }
}
