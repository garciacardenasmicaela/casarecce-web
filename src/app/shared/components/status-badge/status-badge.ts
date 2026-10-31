import { Component, computed, input } from '@angular/core';
import { ESTADOS_LOCAL } from '../../../core/config/local.config';
import { EstadoLocal } from '../../../core/models';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  estado = input.required<EstadoLocal>();
  etiqueta = computed(() => ESTADOS_LOCAL.find(e => e.valor === this.estado())?.etiqueta ?? '');
}
