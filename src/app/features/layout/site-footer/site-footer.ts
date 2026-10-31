import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { LOCAL_INFO } from '../../../core/config/local.config';
import { CustomerService } from '../../../core/services/customer.service';
import { DialogsService } from '../../../core/services/dialogs.service';
import { NotificationService } from '../../../core/services/notification.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-site-footer',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, RouterLink, BrandLogo],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
  host: { id: 'footer-contacto' },
})
export class SiteFooter {
  private readonly clientes = inject(CustomerService);
  private readonly notificar = inject(NotificationService);
  protected readonly dialogs = inject(DialogsService);

  protected readonly info = LOCAL_INFO;
  protected readonly anio = new Date().getFullYear();
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });

  suscribir() {
    if (this.email.invalid) return this.email.markAsTouched();
    this.clientes.suscribirEmail(this.email.value.trim());
    this.email.reset('');
    this.notificar.mostrar('¡Te sumaste a las novedades de Casarecce!');
  }
}
