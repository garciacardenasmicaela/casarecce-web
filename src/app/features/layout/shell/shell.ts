import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from '../site-footer/site-footer';
import { SiteHeader } from '../site-header/site-header';
import { StatusBar } from '../status-bar/status-bar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, StatusBar, SiteHeader, SiteFooter],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
