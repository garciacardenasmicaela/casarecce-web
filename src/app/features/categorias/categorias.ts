import { Component, inject } from '@angular/core';
import { CatalogService } from '../../core/services/catalog.service';
import { CategoryPill } from '../../shared/components/category-pill/category-pill';
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-categorias',
  imports: [SectionHeader, CategoryPill],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
  host: { id: 'categorias' },
})
export class Categorias {
  protected readonly catalogo = inject(CatalogService);
}
