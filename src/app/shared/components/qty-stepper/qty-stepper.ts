import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-qty-stepper',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './qty-stepper.html',
  styleUrl: './qty-stepper.scss',
})
export class QtyStepper {
  cantidad = input.required<number>();
  cambiar = output<1 | -1>();
}
