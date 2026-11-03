import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

/** El WhatsApp debe tener al menos 8 dígitos (acepta espacios, guiones y +). */
const whatsappValido: ValidatorFn = c =>
  String(c.value ?? '').replace(/\D/g, '').length >= 8 ? null : { whatsapp: true };

/** El DNI argentino tiene 7 u 8 dígitos (se aceptan puntos y espacios). */
const dniValido: ValidatorFn = c => (/^\d{7,8}$/.test(String(c.value ?? '').replace(/\D/g, '')) ? null : { dni: true });

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

/** Grupo Nombre / DNI / Email del 10% OFF (todo obligatorio). */
export function crearFormDescuento() {
  const control = (validadores: ValidatorFn[]) => new FormControl('', { nonNullable: true, validators: validadores });
  return new FormGroup({
    nombre: control([Validators.required]),
    dni: control([Validators.required, dniValido]),
    email: control([Validators.required, Validators.email]),
  });
}
