import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  templateUrl: './section-header.html',
  styleUrl: './section-header.scss',
  host: { '[class.centrado]': 'centrado()' },
})
export class SectionHeader {
  titulo = input.required<string>();
  eyebrow = input<string>();
  subtitulo = input<string>();
  centrado = input(false);
}
