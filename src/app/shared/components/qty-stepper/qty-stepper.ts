import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/** +/- con valor. Con `editable` el número se puede tipear (admin: unidades en stock). */
@Component({
  selector: 'app-qty-stepper',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './qty-stepper.html',
  styleUrl: './qty-stepper.scss',
})
export class QtyStepper {
  cantidad = input.required<number>();
  editable = input(false);
  sufijo = input('');
  cambiar = output<1 | -1>();
  fijar = output<number>();

  protected confirmar(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const n = Math.max(0, Math.floor(Number(campo.value)));
    this.fijar.emit(Number.isFinite(n) ? n : 0);
    campo.value = String(this.cantidad());
  }
}
