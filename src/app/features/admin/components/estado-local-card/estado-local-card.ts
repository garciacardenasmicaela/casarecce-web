import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ESTADOS_LOCAL } from '../../../../core/config/local.config';
import { EstadoLocal } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { StoreStatusService } from '../../../../core/services/store-status.service';

@Component({
  selector: 'app-estado-local-card',
  imports: [MatCardModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './estado-local-card.html',
  styleUrl: './estado-local-card.scss',
})
export class EstadoLocalCard {
  protected readonly estado = inject(StoreStatusService);
  private readonly notificar = inject(NotificationService);
  protected readonly opciones = ESTADOS_LOCAL;

  async cambiar(valor: EstadoLocal) {
    const ok = await this.estado.cambiar(valor);
    this.notificar.mostrar(ok ? 'Estado del local actualizado' : 'No se pudo guardar. ¿Iniciaste sesión como administrador?');
  }
}
