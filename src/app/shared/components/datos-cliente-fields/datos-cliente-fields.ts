import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/** Campos Nombre / (WhatsApp o DNI) / Email, reutilizados en el pedido y en el 10% OFF. */
@Component({
  selector: 'app-datos-cliente-fields',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './datos-cliente-fields.html',
  styleUrl: './datos-cliente-fields.scss',
})
export class DatosClienteFields {
  grupo = input.required<FormGroup>();
  /** true: Nombre y WhatsApp lado a lado (el email siempre ocupa el ancho completo). */
  dosColumnas = input(false);
  emailOpcional = input(false);
  /** Segundo campo: WhatsApp (pedido) o DNI (10% OFF). */
  campo = input<'whatsapp' | 'dni'>('whatsapp');
}
