import { Component, input } from '@angular/core';
import { BrandMark } from '../brand-mark/brand-mark';

@Component({
  selector: 'app-brand-monogram',
  imports: [BrandMark],
  templateUrl: './brand-monogram.html',
  styleUrl: './brand-monogram.scss',
})
export class BrandMonogram {
  tamano = input(56);
  fondo = input('#DD1323');
  trazo = input('#FAF7F2');
}
