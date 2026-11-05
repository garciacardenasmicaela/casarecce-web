import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { EstadoPedido, PedidoRegistrado } from '../../../core/models';
import { PedidosApi } from '../../../core/pedido/pedidos.api';
import { WhatsAppService } from '../../../core/pedido/whatsapp.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

const ESTADOS: { valor: EstadoPedido; texto: string; icono: string }[] = [
  { valor: 'nuevo', texto: 'Nuevo', icono: 'fiber_new' },
  { valor: 'confirmado', texto: 'Confirmado', icono: 'check_circle' },
  { valor: 'entregado', texto: 'Entregado', icono: 'local_shipping' },
  { valor: 'cancelado', texto: 'Cancelado', icono: 'cancel' },
];

@Component({
  selector: 'app-admin-pedidos',
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatMenuModule, EmptyState],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class AdminPedidos implements OnInit {
  private readonly api = inject(PedidosApi);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly notificar = inject(NotificationService);

  protected readonly estados = ESTADOS;
  protected readonly cargando = this.api.cargando;
  protected readonly error = this.api.error;
  protected readonly filtro = signal<EstadoPedido | 'todos'>('todos');
  protected readonly visibles = computed(() =>
    this.api.pedidos().filter(p => this.filtro() === 'todos' || p.estado === this.filtro()),
  );
  protected readonly nuevos = computed(() => this.api.pedidos().filter(p => p.estado === 'nuevo').length);

  ngOnInit() {
    void this.api.cargar();
  }

  protected recargar() {
    void this.api.cargar();
  }

  protected texto(estado: EstadoPedido) {
    return ESTADOS.find(e => e.valor === estado)?.texto ?? estado;
  }

  protected async cambiar(p: PedidoRegistrado, estado: EstadoPedido) {
    if (p.estado === estado) return;
    const ok = await this.api.cambiarEstado(p, estado);
    this.notificar.mostrar(ok ? `Pedido #${p.numero}: ${this.texto(estado).toLowerCase()}` : 'No se pudo cambiar el estado');
  }

  protected enlaceWhatsApp(p: PedidoRegistrado) {
    return this.whatsapp.enlaceACliente(p.whatsapp, `Hola ${p.nombre}! Te escribimos de Casarecce por tu pedido #${p.numero}.`);
  }
}
