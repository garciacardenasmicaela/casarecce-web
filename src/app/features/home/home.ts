import { Component } from '@angular/core';
import { Catalogo } from '../catalogo/catalogo';
import { Categorias } from '../categorias/categorias';
import { Hero } from '../hero/hero';
import { LocalInfo } from '../local-info/local-info';

@Component({
  selector: 'app-home',
  imports: [Hero, Categorias, Catalogo, LocalInfo],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
