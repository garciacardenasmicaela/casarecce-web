import { Component, inject, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ImagenNueva } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

const MAX_BYTES = 5 * 1024 * 1024;

/** Elegir foto: subir un archivo o pegar un link, con vista previa. */
@Component({
  selector: 'app-image-upload',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss',
})
export class ImageUpload {
  cambio = output<ImagenNueva>();
  private readonly notificar = inject(NotificationService);

  protected readonly url = new FormControl('', { nonNullable: true });
  protected readonly vistaPrevia = signal('');
  protected readonly nombreArchivo = signal('');
  private archivo: File | null = null;

  constructor() {
    this.url.valueChanges.subscribe(valor => {
      this.archivo = null;
      this.nombreArchivo.set('');
      this.vistaPrevia.set(valor.trim());
      this.emitir();
    });
  }

  protected elegirArchivo(evento: Event) {
    const campo = evento.target as HTMLInputElement;
    const archivo = campo.files?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/') || archivo.size > MAX_BYTES) {
      this.notificar.mostrar('Elegí una imagen (JPG, PNG o WebP) de hasta 5 MB.');
      campo.value = '';
      return;
    }
    this.archivo = archivo;
    this.nombreArchivo.set(archivo.name);
    this.url.setValue('', { emitEvent: false });
    const lector = new FileReader();
    lector.onload = () => {
      this.vistaPrevia.set(String(lector.result));
      this.emitir();
    };
    lector.readAsDataURL(archivo);
    campo.value = '';
  }

  reiniciar() {
    this.archivo = null;
    this.nombreArchivo.set('');
    this.vistaPrevia.set('');
    this.url.setValue('', { emitEvent: false });
    this.emitir();
  }

  private emitir() {
    this.cambio.emit({ archivo: this.archivo, url: this.url.value.trim(), vistaPrevia: this.vistaPrevia() });
  }
}
