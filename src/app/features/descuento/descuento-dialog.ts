import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';
import { BrandMonogram } from '../../shared/components/brand-monogram/brand-monogram';
import { DatosClienteFields } from '../../shared/components/datos-cliente-fields/datos-cliente-fields';
import { crearFormCliente } from '../../shared/forms/cliente-form';

@Component({
  selector: 'app-descuento-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatIconModule, BrandMonogram, DatosClienteFields],
  templateUrl: './descuento-dialog.html',
  styleUrl: './descuento-dialog.scss',
})
export class DescuentoDialog {
  private readonly clientes = inject(CustomerService);
  private readonly notificar = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<DescuentoDialog>);

  protected readonly form = crearFormCliente(true);

  aplicar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.clientes.activarDescuento(this.form.getRawValue());
    this.notificar.mostrar('¡10% OFF de bienvenida activado!');
    this.dialogRef.close(true);
  }
}
