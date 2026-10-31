import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Producto } from '../../../../core/models';

@Component({
  selector: 'app-product-stock-row',
  imports: [MatFormFieldModule, MatInputModule, MatSlideToggleModule],
  templateUrl: './product-stock-row.html',
  styleUrl: './product-stock-row.scss',
})
export class ProductStockRow {
  producto = input.required<Producto>();
  precioCambiado = output<number>();
  stockAlternado = output<void>();

  protected alCambiarPrecio(evento: Event) {
    this.precioCambiado.emit(Number((evento.target as HTMLInputElement).value));
  }
}
