import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './common/services/authentication.service'; 
import { Observable, from } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.getCurrentUser().pipe(
      take(1), // Tomar solo una emisión del estado del usuario
      switchMap((user) => {
        if (user) {
          // Convertir la respuesta de getUserData (Promise) en Observable usando `from`
          return from(this.authService.getUserData(user.uid)).pipe(
            map((userData: any) => {
              if (userData?.role === 'admin') {
                return true; // Permitir acceso si es admin
              } else {
                this.router.navigate(['/home']); // Redirigir si no es admin
                return false;
              }
            })
          );
        } else {
          this.router.navigate(['/login']); // Redirigir si no hay sesión
          return from([false]); // Devuelve un Observable con false
        }
      })
    );
  }
}
