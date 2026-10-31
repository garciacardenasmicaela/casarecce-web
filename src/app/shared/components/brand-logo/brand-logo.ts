import { Component, computed, input } from '@angular/core';
import { BrandMonogram } from '../brand-monogram/brand-monogram';

/** Logo oficial. "positivo" sobre fondo claro, "negativo" sobre rojo. */
@Component({
  selector: 'app-brand-logo',
  imports: [BrandMonogram],
  templateUrl: './brand-logo.html',
  styleUrl: './brand-logo.scss',
  host: { '[class.negativo]': 'variante() === "negativo"' },
})
export class BrandLogo {
  variante = input<'positivo' | 'negativo'>('positivo');
  tamano = input(56);

  fondo = computed(() => (this.variante() === 'positivo' ? '#DD1323' : '#FAF7F2'));
  trazo = computed(() => (this.variante() === 'positivo' ? '#FAF7F2' : '#DD1323'));
}
