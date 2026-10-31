import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-category-pill',
  imports: [MatIconModule, MatRippleModule],
  templateUrl: './category-pill.html',
  styleUrl: './category-pill.scss',
})
export class CategoryPill {
  icono = input.required<string>();
  etiqueta = input.required<string>();
  activa = input(false);
  seleccionar = output<void>();
}
