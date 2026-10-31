import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BrandSeal } from '../../shared/components/brand-seal/brand-seal';
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-local-info',
  imports: [MatCardModule, BrandSeal, SectionHeader],
  templateUrl: './local-info.html',
  styleUrl: './local-info.scss',
  host: { id: 'nosotros' },
})
export class LocalInfo {
  protected readonly pasos = [
    { titulo: '1. Elegís online', texto: 'Con porciones exactas en cada plato para calcular fácil.' },
    { titulo: '2. Sin registros', texto: 'Tu pedido sale armado y prolijo directo al WhatsApp del local.' },
    { titulo: '3. Retiro o Envío', texto: 'Retirás por el local o coordinamos envío por Uber Flash.' },
  ];
}
