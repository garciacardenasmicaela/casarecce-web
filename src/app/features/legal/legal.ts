import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DOCUMENTOS_LEGALES } from './legal.content';

/** Muestra la política de privacidad o los términos, según `data.tipo` de la ruta. */
@Component({
  selector: 'app-legal',
  imports: [RouterLink],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class Legal {
  protected readonly documento = DOCUMENTOS_LEGALES[inject(ActivatedRoute).snapshot.data['tipo'] as 'privacidad' | 'terminos'];
}
