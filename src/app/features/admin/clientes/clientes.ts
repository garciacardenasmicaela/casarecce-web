import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { CustomerService } from '../../../core/services/customer.service';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-admin-clientes',
  imports: [MatCardModule, MatTableModule, EmptyState],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class AdminClientes implements OnInit {
  private readonly servicio = inject(CustomerService);
  protected readonly clientes = this.servicio.clientes;
  protected readonly columnas = ['nombre', 'whatsapp', 'email'];

  ngOnInit() {
    void this.servicio.cargar();
  }
}
