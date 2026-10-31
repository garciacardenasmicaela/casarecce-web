import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  mostrar(mensaje: string) {
    this.snackBar.open(mensaje, 'OK', {
      duration: 3200,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: 'casarecce-toast',
    });
  }
}
