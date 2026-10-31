import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CustomerService } from '../../../core/services/customer.service';
import { DialogsService } from '../../../core/services/dialogs.service';
import { BrandLogo } from '../../../shared/components/brand-logo/brand-logo';

@Component({
  selector: 'app-site-header',
  imports: [MatMenuModule, MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, BrandLogo],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly cart = inject(CartService);
  protected readonly dialogs = inject(DialogsService);
  protected readonly clientes = inject(CustomerService);

  protected readonly enlaces = [
    { texto: 'Catálogo', fragmento: 'catalogo' },
    { texto: 'Categorías', fragmento: 'categorias' },
    { texto: 'Nosotros', fragmento: 'nosotros' },
    { texto: 'Ubicación', fragmento: 'footer-contacto' },
  ];
}
