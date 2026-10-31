import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Punto único para abrir el carrito (panel lateral) y el diálogo del 10% OFF. */
@Injectable({ providedIn: 'root' })
export class DialogsService {
  private readonly dialog = inject(MatDialog);
  private readonly bp = inject(BreakpointObserver);

  private get esCelular() {
    return this.bp.isMatched(Breakpoints.XSmall);
  }

  async abrirCarrito() {
    const { Carrito } = await import('../../features/carrito/carrito');
    const celular = this.esCelular;
    return this.dialog.open(Carrito, {
      position: { top: '0', right: '0' },
      width: celular ? '100vw' : '448px',
      maxWidth: '100vw',
      height: '100dvh',
      panelClass: 'cart-panel',
      autoFocus: false,
    });
  }

  async abrirDescuento() {
    const { DescuentoDialog } = await import('../../features/descuento/descuento-dialog');
    return this.dialog.open(DescuentoDialog, {
      width: '440px',
      maxWidth: 'calc(100vw - 24px)',
      maxHeight: '100dvh',
    });
  }
}
