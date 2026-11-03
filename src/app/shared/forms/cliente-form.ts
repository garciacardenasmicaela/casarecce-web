import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

/** El WhatsApp debe tener al menos 8 dígitos (acepta espacios, guiones y +). */
const whatsappValido: ValidatorFn = c =>
  String(c.value ?? '').replace(/\D/g, '').length >= 8 ? null : { whatsapp: true };

/** Grupo Nombre / WhatsApp / Email compartido por el pedido y el 10% OFF. */
export function crearFormCliente(emailObligatorio: boolean) {
  const control = (validadores = [Validators.required]) =>
    new FormControl('', { nonNullable: true, validators: validadores });

  return new FormGroup({
    nombre: control(),
    whatsapp: control([Validators.required, whatsappValido]),
    email: control(emailObligatorio ? [Validators.required, Validators.email] : [Validators.email]),
  });
}
