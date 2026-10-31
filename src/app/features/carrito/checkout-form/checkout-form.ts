import { Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AVISO_UBER_FLASH,
  OPCIONES_CUANDO,
  OPCIONES_ENTREGA,
  OPCIONES_PAGO,
} from '../../../core/config/local.config';
import { DatosPedido, MetodoEntrega, MetodoPago } from '../../../core/models';
import { CustomerService } from '../../../core/services/customer.service';
import { DatosClienteFields } from '../../../shared/components/datos-cliente-fields/datos-cliente-fields';
import { crearFormCliente } from '../../../shared/forms/cliente-form';

@Component({
  selector: 'app-checkout-form',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    DatosClienteFields,
  ],
  templateUrl: './checkout-form.html',
  styleUrl: './checkout-form.scss',
})
export class CheckoutForm {
  private readonly clientes = inject(CustomerService);

  protected readonly cuando = OPCIONES_CUANDO;
  protected readonly entregas = OPCIONES_ENTREGA;
  protected readonly pagos = OPCIONES_PAGO;
  protected readonly avisoUber = AVISO_UBER_FLASH;

  protected readonly cliente = crearFormCliente(false);
  protected readonly pedido = new FormGroup({
    cuando: new FormControl(OPCIONES_CUANDO[0], { nonNullable: true }),
    entrega: new FormControl<MetodoEntrega>('retiro', { nonNullable: true }),
    pago: new FormControl<MetodoPago>('transferencia', { nonNullable: true }),
    efectivoCon: new FormControl('', { nonNullable: true }),
    notas: new FormControl('', { nonNullable: true }),
  });

  protected readonly entrega = toSignal(this.pedido.controls.entrega.valueChanges, { initialValue: 'retiro' as MetodoEntrega });
  protected readonly pago = toSignal(this.pedido.controls.pago.valueChanges, { initialValue: 'transferencia' as MetodoPago });

  constructor() {
    // Si el cliente ya dejó sus datos (p. ej. en el 10% OFF), se precargan
    effect(() => {
      const datos = this.clientes.datosActuales();
      if (datos) this.cliente.patchValue(datos);
    });
  }

  protected loginSocial(proveedor: 'google' | 'facebook' | 'apple') {
    this.clientes.iniciarSesionSocial(proveedor);
  }

  /** Devuelve el pedido listo para enviar, o null si faltan datos obligatorios. */
  obtener(): DatosPedido | null {
    if (this.cliente.invalid) {
      this.cliente.markAllAsTouched();
      return null;
    }
    return { ...this.cliente.getRawValue(), ...this.pedido.getRawValue() };
  }
}
