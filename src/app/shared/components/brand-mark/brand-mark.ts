import { Component, input } from '@angular/core';

/**
 * Roseta de 8 lóbulos + "A" con arco (monograma oficial).
 * Se usa sobre un <g brandMark> dentro de cualquier <svg viewBox="0 0 100 100">.
 */
@Component({
  selector: 'g[brandMark]',
  templateUrl: './brand-mark.html',
})
export class BrandMark {
  fondo = input('#DD1323');
  trazo = input('#FAF7F2');

  readonly roseta =
    'M 50,4 C 57,4 61,9 67,11 C 73,13 79,11 83,16 C 88,21 86,27 89,33 C 91,39 96,43 96,50 C 96,57 91,61 89,67 C 86,73 88,79 83,83 C 79,88 73,86 67,89 C 61,91 57,96 50,96 C 43,96 39,91 33,89 C 27,86 21,88 16,83 C 11,79 13,73 11,67 C 9,61 4,57 4,50 C 4,43 9,39 11,33 C 13,27 11,21 16,16 C 21,11 27,13 33,11 C 39,9 43,4 50,4 Z';
}
