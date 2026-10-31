import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SupabaseService } from '../../../core/services/supabase.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, BrandLogo],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  protected readonly modoDemo = environment.modoDemo;
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  async ingresar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.cargando.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    const { error } = await this.supabase.signInWithPassword(email, password);
    if (error) {
      this.cargando.set(false);
      return this.error.set('Email o contraseña incorrectos.');
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
