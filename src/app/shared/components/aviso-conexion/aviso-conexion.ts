import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Franja que aparece solo cuando el dispositivo se queda sin internet. */
@Component({
  selector: 'app-aviso-conexion',
  imports: [MatIconModule],
  templateUrl: './aviso-conexion.html',
  styleUrl: './aviso-conexion.scss',
})
export class AvisoConexion {
  protected readonly enLinea = signal(typeof navigator === 'undefined' ? true : navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.enLinea.set(true));
    window.addEventListener('offline', () => this.enLinea.set(false));
  }
}
