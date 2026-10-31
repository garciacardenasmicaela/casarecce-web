import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DialogsService } from '../../core/services/dialogs.service';
import { ImgFallback } from '../../shared/directives/img-fallback.directive';

@Component({
  selector: 'app-hero',
  imports: [MatButtonModule, MatChipsModule, MatIconModule, RouterLink, ImgFallback],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  protected readonly dialogs = inject(DialogsService);
  protected readonly imagen =
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000';
}
