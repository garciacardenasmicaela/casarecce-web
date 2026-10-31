import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CodigosAdminService } from '../../../../core/descuento/codigos-admin.service';
import { estadoDeCodigo, formatearCodigo } from '../../../../core/descuento/codigo.utils';
import { Cliente } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { EstadoCodigoChip } from '../estado-codigo-chip/estado-codigo-chip';

/** "Verificar código": el admin escribe el que le muestra el cliente y ve si sirve. */
@Component({
  selector: 'app-verificador-codigo',
  imports: [
    DatePipe, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
    EstadoCodigoChip,
  ],
  templateUrl: './verificador-codigo.html',
  styleUrl: './verificador-codigo.scss',
})
export class VerificadorCodigo {
  private readonly admin = inject(CodigosAdminService);
  private readonly notificar = inject(NotificationService);

  protected readonly texto = new FormControl('', { nonNullable: true, validators: Validators.required });
  protected readonly cargando = signal(false);
  protected readonly buscado = signal(false);
  protected readonly cliente = signal<Cliente | null>(null);

  protected readonly formateado = computed(() => formatearCodigo(this.cliente()?.codigo?.codigo ?? ''));
  protected readonly vigente = computed(() => {
    const c = this.cliente()?.codigo;
    return !!c && estadoDeCodigo(c) === 'vigente';
  });

  async verificar() {
    if (this.texto.invalid) return this.texto.markAsTouched();
    this.cargando.set(true);
    this.cliente.set(await this.admin.buscar(this.texto.value));
    this.buscado.set(true);
    this.cargando.set(false);
  }

  async marcarUsado() {
    const c = this.cliente();
    if (!c) return;
    if (await this.admin.marcarUsado(c)) {
      this.cliente.set(await this.admin.buscar(this.texto.value));
      this.notificar.mostrar('Código marcado como usado');
    } else {
      this.notificar.mostrar('No se pudo actualizar. ¿Iniciaste sesión como administrador?');
    }
  }
}
