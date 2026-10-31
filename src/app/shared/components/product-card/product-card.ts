import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { STOCK_BAJO } from '../../../core/config/local.config';
import { Producto } from '../../../core/models';
import { IMAGEN_POR_DEFECTO, ImgFallback } from '../../directives/img-fallback.directive';
import { PrecioPipe } from '../../pipes/precio.pipe';

@Component({
  selector: 'app-product-card',
  imports: [MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, PrecioPipe, ImgFallback],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  producto = input.required<Producto>();
  categoria = input<string>();
  agregar = output<Producto>();

  protected readonly imagenPorDefecto = IMAGEN_POR_DEFECTO;
  protected readonly agotado = computed(() => this.producto().stock <= 0);
  protected readonly pocas = computed(() => this.producto().stock <= STOCK_BAJO);
}
