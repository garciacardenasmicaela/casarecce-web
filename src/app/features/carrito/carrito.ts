import { Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../core/services/cart.service';
import { CustomerService } from '../../core/services/customer.service';
import { DialogsService } from '../../core/services/dialogs.service';
import { OrderService } from '../../core/services/order.service';
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
  protected readonly clientes = inject(CustomerService);
  private readonly dialogs = inject(DialogsService);
  private readonly pedidos = inject(OrderService);
  private readonly checkout = viewChild(CheckoutForm);

  activarDescuento() {
    this.dialogs.abrirDescuento();
  }

  enviar() {
    const datos = this.checkout()?.obtener();
    if (datos) this.pedidos.enviarPorWhatsApp(datos);
  }
}
