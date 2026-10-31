import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Producto } from '../../../core/models';
import { IMAGEN_POR_DEFECTO, ImgFallback } from '../../directives/img-fallback.directive';
import { PrecioPipe } from '../../pipes/precio.pipe';

@Component({
  selector: 'app-product-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, PrecioPipe, ImgFallback],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  producto = input.required<Producto>();
  categoria = input<string>();
  agregar = output<Producto>();

  protected readonly imagenPorDefecto = IMAGEN_POR_DEFECTO;
}
