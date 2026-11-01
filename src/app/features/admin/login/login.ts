import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

/** Ingreso del panel: email + contraseña, o email + código de 6 dígitos que llega por mail. */
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatTabsModule, BrandLogo,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly modoDemo = environment.modoDemo;
  protected readonly codigoHabilitado = environment.loginPorCodigo;
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly mostrarClave = signal(false);

  // Pestaña 1: contraseña
  protected readonly formClave = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  // Pestaña 2: código por email (2 pasos)
  protected readonly emailCodigo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly codigo = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6,8}$/)] });
  protected readonly codigoEnviado = signal(false);

  async ingresarConClave() {
    if (this.formClave.invalid) return this.formClave.markAllAsTouched();
    const { email, password } = this.formClave.getRawValue();
    await this.ejecutar(() => this.supabase.signInWithPassword(email, password), 'Email o contraseña incorrectos.');
  }

  async enviarCodigo() {
    if (this.emailCodigo.invalid) return this.emailCodigo.markAsTouched();
    this.cargando.set(true);
    this.error.set('');
    const { error } = await this.supabase.enviarCodigoLogin(this.emailCodigo.value.trim());
    this.cargando.set(false);
    if (error) {
      return this.error.set(
        error.status === 429
          ? 'Pediste demasiados códigos seguidos. Esperá un rato o ingresá con contraseña.'
          : 'No pudimos enviar el código. Revisá el email o ingresá con contraseña.',
      );
    }
    this.codigoEnviado.set(true);
  }

  async verificarCodigo() {
    if (this.codigo.invalid) return this.codigo.markAsTouched();
    await this.ejecutar(
      () => this.supabase.verificarCodigoLogin(this.emailCodigo.value.trim(), this.codigo.value.trim()),
      'El código es incorrecto o venció. Pedí uno nuevo.',
    );
  }

  cambiarEmail() {
    this.codigoEnviado.set(false);
    this.codigo.reset('');
    this.error.set('');
  }

  /** Inicia sesión y deja pasar solo si el email figura en la tabla `admins`. */
  private async ejecutar(iniciar: () => PromiseLike<{ error: unknown }>, mensajeError: string) {
    this.cargando.set(true);
    this.error.set('');
    const { error } = await iniciar();
    if (error) {
      this.cargando.set(false);
      return this.error.set(mensajeError);
    }
    if (!(await this.supabase.esAdmin())) {
      await this.supabase.signOut();
      this.cargando.set(false);
      return this.error.set('Tu usuario no tiene permisos de administrador.');
    }
    this.cargando.set(false);
    this.router.navigate(['/admin']);
  }
}
