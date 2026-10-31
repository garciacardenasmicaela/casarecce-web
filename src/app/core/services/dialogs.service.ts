import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Punto único para abrir el carrito (panel lateral) y el diálogo del 10% OFF. */
@Injectable({ providedIn: 'root' })
export class DialogsService {
  private readonly dialog = inject(MatDialog);

  async abrirCarrito() {
    const { Carrito } = await import('../../features/carrito/carrito');
    return this.dialog.open(Carrito, {
      position: { top: '0', right: '0' },
      width: '448px',
      maxWidth: '100vw',
      height: '100vh',
      panelClass: 'cart-panel',
      autoFocus: false,
    });
  }

  async abrirDescuento() {
    const { DescuentoDialog } = await import('../../features/descuento/descuento-dialog');
    return this.dialog.open(DescuentoDialog, {
      width: '440px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }
}
