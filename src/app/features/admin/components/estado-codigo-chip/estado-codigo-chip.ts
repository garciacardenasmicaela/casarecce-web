import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ETIQUETA_ESTADO, estadoDeCodigo } from '../../../../core/descuento/codigo.utils';
import { CodigoDescuento } from '../../../../core/models';

/** Etiqueta de color: Vigente / Usado / Vencido. */
@Component({
  selector: 'app-estado-codigo-chip',
  imports: [MatChipsModule],
  templateUrl: './estado-codigo-chip.html',
  styleUrl: './estado-codigo-chip.scss',
})
export class EstadoCodigoChip {
  codigo = input.required<CodigoDescuento>();
  protected readonly estado = computed(() => estadoDeCodigo(this.codigo()));
  protected readonly etiqueta = computed(() => ETIQUETA_ESTADO[this.estado()]);
}
