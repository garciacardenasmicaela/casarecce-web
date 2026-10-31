import { Component, input } from '@angular/core';
import { PrecioPipe } from '../../../shared/pipes/precio.pipe';

@Component({
  selector: 'app-carrito-totales',
  imports: [PrecioPipe],
  templateUrl: './carrito-totales.html',
  styleUrl: './carrito-totales.scss',
})
export class CarritoTotales {
  subtotal = input.required<number>();
  descuento = input.required<number>();
  total = input.required<number>();
}
