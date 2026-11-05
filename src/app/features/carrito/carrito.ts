import { Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';
import { DescuentoService } from '../../core/descuento/descuento.service';
import { DialogsService } from '../../core/services/dialogs.service';
import { PedidoService } from '../../core/pedido/pedido.service';
import { StoreStatusService } from '../../core/services/store-status.service';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { CarritoItem } from './carrito-item/carrito-item';
import { CarritoTotales } from './carrito-totales/carrito-totales';
import { CheckoutForm } from './checkout-form/checkout-form';

/** Panel lateral "Tu Pedido" (se abre desde el header con DialogsService). */
@Component({
  selector: 'app-carrito',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, EmptyState, CarritoItem, CarritoTotales, CheckoutForm],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  protected readonly cart = inject(CartService);
  protected readonly descuento = inject(DescuentoService);
  protected readonly local = inject(StoreStatusService).estado;
  private readonly dialogs = inject(DialogsService);
  private readonly pedidos = inject(PedidoService);
  private readonly dialogRef = inject(MatDialogRef<Carrito>);
  private readonly checkout = viewChild(CheckoutForm);

  activarDescuento() {
    this.dialogs.abrirDescuento();
  }

  async enviar() {
    const datos = this.checkout()?.obtener();
    if (datos && (await this.pedidos.confirmar(datos))) this.dialogRef.close();
  }
}
