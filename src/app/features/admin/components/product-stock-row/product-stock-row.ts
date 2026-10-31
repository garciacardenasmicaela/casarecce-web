import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Producto } from '../../../../core/models';
import { IMAGEN_POR_DEFECTO, ImgFallback } from '../../../../shared/directives/img-fallback.directive';
import { QtyStepper } from '../../../../shared/components/qty-stepper/qty-stepper';

@Component({
  selector: 'app-product-stock-row',
  imports: [MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, QtyStepper, ImgFallback],
  templateUrl: './product-stock-row.html',
  styleUrl: './product-stock-row.scss',
})
export class ProductStockRow {
  producto = input.required<Producto>();
  precioCambiado = output<number>();
  stockAjustado = output<number>();
  stockFijado = output<number>();
  stockAlternado = output<void>();

  protected readonly imagenPorDefecto = IMAGEN_POR_DEFECTO;

  protected alCambiarPrecio(evento: Event) {
    this.precioCambiado.emit(Number((evento.target as HTMLInputElement).value));
  }
}
