import { FormControl, FormGroup, Validators } from '@angular/forms';

/** Grupo Nombre / WhatsApp / Email compartido por el pedido y el 10% OFF. */
export function crearFormCliente(emailObligatorio: boolean) {
  const control = (validadores = [Validators.required]) =>
    new FormControl('', { nonNullable: true, validators: validadores });

  return new FormGroup({
    nombre: control(),
    whatsapp: control(),
    email: control(emailObligatorio ? [Validators.required, Validators.email] : [Validators.email]),
  });
}
