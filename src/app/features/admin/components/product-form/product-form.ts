import { Component, output, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CATEGORIAS, STOCK_INICIAL_NUEVO } from '../../../../core/config/local.config';
import { CategoriaSlug, ImagenNueva, NuevoProducto } from '../../../../core/models';
import { ImageUpload } from '../../../../shared/components/image-upload/image-upload';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, ImageUpload],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm {
  crear = output<{ producto: NuevoProducto; imagen: ImagenNueva | null }>();

  private readonly selectorImagen = viewChild(ImageUpload);
  private readonly formulario = viewChild(FormGroupDirective);
  private imagen: ImagenNueva | null = null;

  protected readonly categorias = CATEGORIAS.filter(c => c.slug !== 'all');
  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    categoria: new FormControl<CategoriaSlug>('pastas', { nonNullable: true }),
    precio: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(1), Validators.max(9_999_999)] }),
    stock: new FormControl<number>(STOCK_INICIAL_NUEVO, { nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(99_999)] }),
    porciones: new FormControl('', { nonNullable: true, validators: Validators.required }),
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  protected alElegirImagen(imagen: ImagenNueva) {
    this.imagen = imagen.archivo || imagen.url ? imagen : null;
  }

  publicar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    const v = this.form.getRawValue();
    this.crear.emit({ producto: { ...v, precio: v.precio!, stock: Math.floor(v.stock) }, imagen: this.imagen });
    // resetForm (y no reset) también limpia el estado "enviado": si no, los campos vacíos quedan en rojo
    this.formulario()?.resetForm({ categoria: 'pastas', stock: STOCK_INICIAL_NUEVO });
    this.selectorImagen()?.reiniciar();
  }
}
