import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {
  misTrabajos: any[] = []; // Lista de trabajos creados por el usuario
  miCarrera: any[] = [];   // Lista de trabajos donde el usuario es el trabajador contratado
  userId: string | null = null;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.getTrabajosRelacionados();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  getTrabajosRelacionados() {
    if (!this.userId) return;

    this.db
      .list('trabajosPosteados')
      .snapshotChanges()
      .subscribe((trabajos: any[]) => {
        const trabajosFiltrados = trabajos.map((trabajo) => {
          const data = trabajo.payload.val();
          const id = trabajo.payload.key;
          return { id, ...data };
        });

        this.misTrabajos = trabajosFiltrados.filter(trabajo => trabajo.creadorId === this.userId);
        this.miCarrera = trabajosFiltrados.filter(trabajo => trabajo.trabajadorContratado === this.userId);

        this.misTrabajos.forEach((trabajo) => {
          if (trabajo.creadorId) {
            this.db
              .object(`users/${trabajo.creadorId}`)
              .valueChanges()
              .subscribe((userData: any) => {
                if (userData) {
                  trabajo.creadorNombre = `${userData.name} ${userData.lastName} ${userData.lastnamef}`;
                }
              });
          }
        });

        this.miCarrera.forEach((trabajo) => {
          if (trabajo.creadorId) {
            this.db
              .object(`users/${trabajo.creadorId}`)
              .valueChanges()
              .subscribe((userData: any) => {
                if (userData) {
                  trabajo.creadorNombre = `${userData.name} ${userData.lastName} ${userData.lastnamef}`;
                }
              });
          }
        });
      });
  }

  goToDetalleTrabajo(trabajo: any) {
    this.router.navigate(['/detalle-trabajo'], { state: { trabajo } }); // Navegar a la página "Detalle Trabajo" con los datos del trabajo
  }

  getBotonAdicional(trabajo: any): boolean {
    return trabajo.creadorId === this.userId;
  }
  goToPerfil() {
    this.router.navigate(['/perfil']);
  }
}
