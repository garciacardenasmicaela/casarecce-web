import { Directive, ElementRef, inject, input } from '@angular/core';

export const IMAGEN_POR_DEFECTO = 'https://placehold.co/800x600/DDD5C0/3C3847?text=Casarecce';

/** Si la imagen falla al cargar, muestra un placeholder de marca. */
@Directive({
  selector: 'img[appImgFallback]',
  host: { '(error)': 'alFallar()' },
})
export class ImgFallback {
  fallback = input(IMAGEN_POR_DEFECTO, { alias: 'appImgFallback' });
  private readonly el = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private usado = false;

  alFallar() {
    if (this.usado) return;
    this.usado = true;
    this.el.nativeElement.src = this.fallback() || IMAGEN_POR_DEFECTO;
  }
}
