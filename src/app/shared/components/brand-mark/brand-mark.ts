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
  trazo = input('#F7F4EB');

  readonly roseta =
    'M 50,4.2 C 56.5,4.2 61.2,9.8 66.8,11.6 C 72.4,13.9 79.3,12.2 83.4,16.6 C 87.8,20.7 86.1,27.6 88.4,33.2 ' +
    'C 90.2,38.8 95.8,43.5 95.8,50 C 95.8,56.5 90.2,61.2 88.4,66.8 C 86.1,72.4 87.8,79.3 83.4,83.4 ' +
    'C 79.3,87.8 72.4,86.1 66.8,88.4 C 61.2,90.2 56.5,95.8 50,95.8 C 43.5,95.8 38.8,90.2 33.2,88.4 ' +
    'C 27.6,86.1 20.7,87.8 16.6,83.4 C 12.2,79.3 13.9,72.4 11.6,66.8 C 9.8,61.2 4.2,56.5 4.2,50 ' +
    'C 4.2,43.5 9.8,38.8 11.6,33.2 C 13.9,27.6 12.2,20.7 16.6,16.6 C 20.7,12.2 27.6,13.9 33.2,11.6 ' +
    'C 38.8,9.8 43.5,4.2 50,4.2 Z';
}
