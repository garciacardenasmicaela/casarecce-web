import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';
import { DIAS_VIGENCIA } from '../../core/descuento/codigo.utils';
import { DescuentoService } from '../../core/descuento/descuento.service';
import { ResultadoSolicitud } from '../../core/models';
import { NotificationService } from '../../core/services/notification.service';
import { DatosClienteFields } from '../../shared/components/datos-cliente-fields/datos-cliente-fields';
import { crearFormDescuento } from '../../shared/forms/cliente-form';

/** "10% OFF en tu 1ª compra": pedir el código (por email) o ingresar uno que ya tenés. */
@Component({
  selector: 'app-descuento-dialog',
  imports: [
    ReactiveFormsModule, FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatProgressBarModule, MatTabsModule, DatosClienteFields,
  ],
  templateUrl: './descuento-dialog.html',
  styleUrl: './descuento-dialog.scss',
})
export class DescuentoDialog {
  private readonly descuento = inject(DescuentoService);
  private readonly notificar = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<DescuentoDialog>);

  protected readonly dias = DIAS_VIGENCIA;
  protected readonly form = crearFormDescuento();
  protected readonly codigo = new FormControl('', { nonNullable: true, validators: Validators.required });

  protected readonly cargando = signal(false);
  protected readonly solicitud = signal<{ resultado: ResultadoSolicitud; email: string } | null>(null);
  protected readonly errorCodigo = signal('');

  async pedirCodigo() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.cargando.set(true);
    const datos = this.form.getRawValue();
    const resultado = await this.descuento.solicitar(datos);
    this.cargando.set(false);
    this.solicitud.set({ resultado, email: datos.email });
  }

  /** ¿El mensaje de éxito promete un email o avisa que lo envía el local? */
  protected get porEmail() {
    return environment.envioEmailAutomatico;
  }

  protected exito(r: ResultadoSolicitud) {
    return r === 'nuevo' || r === 'renovado' || r === 'reenviado' || r === 'espera';
  }

  protected mensajeError(r: ResultadoSolicitud) {
    return {
      usado: 'Este DNI ya usó su beneficio de primera compra.',
      email_invalido: 'Revisá el email: no parece válido.',
      dni_invalido: 'Revisá el DNI: tiene que tener 7 u 8 números.',
      dni_registrado: 'Este DNI ya pidió su código con otro email. Revisá la casilla con la que lo pediste (y el spam).',
      email_en_uso: 'Ese email ya está registrado con otro DNI. Usá tu propio email.',
      error: 'No pudimos generar tu código. Probá de nuevo en un momento.',
    }[r as 'usado' | 'email_invalido' | 'dni_invalido' | 'dni_registrado' | 'email_en_uso' | 'error'];
  }

  volver() {
    this.solicitud.set(null);
  }

  async aplicarCodigo() {
    if (this.codigo.invalid) return this.codigo.markAsTouched();
    this.cargando.set(true);
    const r = await this.descuento.aplicar(this.codigo.value);
    this.cargando.set(false);
    this.errorCodigo.set(r.ok ? '' : r.mensaje);
    if (r.ok) {
      this.notificar.mostrar(r.mensaje);
      this.dialogRef.close(true);
    }
  }
}
