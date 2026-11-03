import { Component, inject, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '../../../core/services/notification.service';
import { NovedadesService } from '../../../core/services/novedades.service';

@Component({
  selector: 'app-admin-novedades',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './novedades.html',
  styleUrl: './novedades.scss',
})
export class AdminNovedades {
  private readonly novedades = inject(NovedadesService);
  private readonly notificar = inject(NotificationService);

  private readonly formulario = viewChild(FormGroupDirective);

  protected readonly form = new FormGroup({
    titulo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    mensaje: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  async enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const { titulo, mensaje } = this.form.getRawValue();
    // TODO: el envío masivo por email requiere un proveedor de correo (Edge Function). Por ahora se guarda.
    if (await this.novedades.guardar({ titulo, mensaje })) {
      this.notificar.mostrar(`Novedad "${titulo}" guardada. Falta conectar el proveedor de email para enviarla.`);
      this.formulario()?.resetForm(); // limpia también el estado "enviado" (si no, quedan en rojo)
    } else {
      this.notificar.mostrar('No se pudo guardar. ¿Iniciaste sesión como administrador?');
    }
  }
}
