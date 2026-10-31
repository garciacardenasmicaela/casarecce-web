import { Component } from '@angular/core';
import { BrandMark } from '../brand-mark/brand-mark';

/** Sello circular oficial (logo secundario). */
@Component({
  selector: 'app-brand-seal',
  imports: [BrandMark],
  templateUrl: './brand-seal.html',
  styleUrl: './brand-seal.scss',
})
export class BrandSeal {}
