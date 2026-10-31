import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ImagenNueva, NuevoProducto } from '../../../core/models';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PrecioPipe } from '../../../shared/pipes/precio.pipe';
import { EstadoLocalCard } from '../components/estado-local-card/estado-local-card';
import { ProductForm } from '../components/product-form/product-form';
import { ProductStockRow } from '../components/product-stock-row/product-stock-row';

@Component({
  selector: 'app-admin-productos',
  imports: [MatCardModule, EstadoLocalCard, ProductStockRow, ProductForm],
  providers: [PrecioPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class AdminProductos {
  protected readonly catalogo = inject(CatalogService);
  private readonly notificar = inject(NotificationService);
  private readonly precio = inject(PrecioPipe);

  async alternarStock(id: string) {
    if (!(await this.catalogo.alternarStock(id))) return;
    const p = this.catalogo.buscar(id)!;
    this.notificar.mostrar(`${p.nombre}: ${p.stock > 0 ? p.stock + " u. disponibles" : "Agotado por hoy"}`);
  }

  ajustarStock(id: string, delta: number) {
    return this.catalogo.ajustarStock(id, delta);
  }

  fijarStock(id: string, unidades: number) {
    return this.catalogo.fijarStock(id, unidades);
  }

  async cambiarPrecio(id: string, valor: number) {
    if (!(valor > 0)) return;
    if (await this.catalogo.actualizarPrecio(id, valor)) {
      this.notificar.mostrar(`Precio actualizado a ${this.precio.transform(valor)}`);
    }
  }

  async crear({ producto, imagen }: { producto: NuevoProducto; imagen: ImagenNueva | null }) {
    if (await this.catalogo.agregar(producto, imagen ?? undefined)) {
      this.notificar.mostrar(`"${producto.nombre}" publicado en el catálogo`);
    }
  }
}
