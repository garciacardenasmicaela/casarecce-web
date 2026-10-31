import { Component, input, output } from '@angular/core';
import { ItemCarrito } from '../../../core/models';
import { QtyStepper } from '../../../shared/components/qty-stepper/qty-stepper';
import { PrecioPipe } from '../../../shared/pipes/precio.pipe';

@Component({
  selector: 'app-carrito-item',
  imports: [QtyStepper, PrecioPipe],
  templateUrl: './carrito-item.html',
  styleUrl: './carrito-item.scss',
})
export class CarritoItem {
  item = input.required<ItemCarrito>();
  cambiar = output<1 | -1>();
}
