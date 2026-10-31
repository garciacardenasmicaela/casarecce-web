import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LOCAL_INFO } from '../../../core/config/local.config';
import { DialogsService } from '../../../core/services/dialogs.service';
import { StoreStatusService } from '../../../core/services/store-status.service';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-status-bar',
  imports: [MatButtonModule, MatIconModule, StatusBadge],
  templateUrl: './status-bar.html',
  styleUrl: './status-bar.scss',
})
export class StatusBar {
  protected readonly estado = inject(StoreStatusService).estado;
  protected readonly dialogs = inject(DialogsService);
  protected readonly horario = LOCAL_INFO.horarioResumen;
}
