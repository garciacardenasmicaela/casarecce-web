import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodigosAdminService } from '../../../core/descuento/codigos-admin.service';
import { formatearCodigo } from '../../../core/descuento/codigo.utils';
import { Cliente } from '../../../core/models';
import { WhatsAppService } from '../../../core/pedido/whatsapp.service';
import { CustomerService } from '../../../core/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { EstadoCodigoChip } from '../components/estado-codigo-chip/estado-codigo-chip';
import { VerificadorCodigo } from '../components/verificador-codigo/verificador-codigo';

@Component({
  selector: 'app-admin-clientes',
  imports: [
    DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatTooltipModule,
    EmptyState, EstadoCodigoChip, VerificadorCodigo,
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class AdminClientes implements OnInit {
  private readonly servicio = inject(CustomerService);
  private readonly codigos = inject(CodigosAdminService);
  private readonly whatsapp = inject(WhatsAppService);
  private readonly notificar = inject(NotificationService);

  protected readonly clientes = this.servicio.clientes;
  protected readonly columnas = ['nombre', 'contacto', 'codigo', 'estado', 'vence', 'acciones'];
  protected readonly formatear = formatearCodigo;

  ngOnInit() {
    void this.servicio.cargar();
  }

  protected enlaceWhatsApp(c: Cliente) {
    return this.whatsapp.enlaceACliente(c.whatsapp, this.codigos.mensajeParaCliente(c));
  }

  protected enlaceEmail(c: Cliente) {
    return this.codigos.enlaceEmail(c);
  }

  protected async copiar(c: Cliente) {
    try {
      await navigator.clipboard.writeText(formatearCodigo(c.codigo!.codigo));
      this.notificar.mostrar('Código copiado');
    } catch {
      // Sin permiso de portapapeles (p. ej. página sin https): se muestra el código para copiarlo a mano
      this.notificar.mostrar(`Código: ${formatearCodigo(c.codigo!.codigo)}`);
    }
  }
}
