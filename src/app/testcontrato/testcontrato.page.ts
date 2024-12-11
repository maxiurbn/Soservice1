import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-testcontrato',
  templateUrl: './testcontrato.page.html',
  styleUrls: ['./testcontrato.page.scss'],
})
export class TestcontratoPage implements OnInit {
  misTrabajos: any[] = []; // Lista de trabajos creados por el usuario
  miCarrera: any[] = [];   // Lista de trabajos donde el usuario es el trabajador contratado
  userId: string | null = null;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,  // Para obtener el userId
    private router: Router,
    private NavCtrl: NavController
  ) {}

  ngOnInit() {
    // Obtener el userId desde el servicio de autenticación
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;  // Asignar el userId del usuario actual
        this.getTrabajosRelacionados();  // Cargar trabajos relacionados al usuario
      } else {
        this.router.navigate(['/login']);  // Redirigir a login si no está autenticado
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
  
        // Filtrar trabajos creados por el usuario excluyendo el estado "finalizado"
        this.misTrabajos = trabajosFiltrados.filter(
          (trabajo) =>
            trabajo.creadorId === this.userId && trabajo.estado !== 'finalizado'
        );
  
        // Filtrar trabajos donde el usuario es el trabajador contratado
        this.miCarrera = trabajosFiltrados.filter(
          (trabajo) => trabajo.trabajadorContratado === this.userId
        );
  
        // Cargar los nombres del creador y del trabajador contratado
        trabajosFiltrados.forEach((trabajo) => {
          // Obtener el nombre del creador del trabajo
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

          // Obtener el nombre del trabajador contratado
          if (trabajo.trabajadorContratado) {
            this.db
              .object(`users/${trabajo.trabajadorContratado}`)
              .valueChanges()
              .subscribe((userData: any) => {
                if (userData) {
                  trabajo.trabajadorNombre = `${userData.name} ${userData.lastName} ${userData.lastnamef}`;
                }
              });
          }
        });
      });
  }

  goToDetalleContrato(trabajoId: string) {
    // Redirige a la página de detalle del trabajo con el id del trabajo
    this.router.navigate([`/detallecontrato`, trabajoId]);
  }

  getBotonAdicional(trabajo: any): boolean {
    // Verifica si el usuario actual es el creador del trabajo
    return trabajo.creadorId === this.userId;
  }

  goBack() {
    this.NavCtrl.back();
  }
}
