import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CATEGORIAS } from '../../../../core/config/local.config';
import { CategoriaSlug, NuevoProducto } from '../../../../core/models';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  crear = output<NuevoProducto>();

  protected readonly categorias = CATEGORIAS.filter(c => c.slug !== 'all');
  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    categoria: new FormControl<CategoriaSlug>('pastas', { nonNullable: true }),
    precio: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    porciones: new FormControl('', { nonNullable: true, validators: Validators.required }),
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  publicar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const v = this.form.getRawValue();
    this.crear.emit({ ...v, precio: v.precio! });
    this.form.reset({ categoria: 'pastas' });
  }
}
