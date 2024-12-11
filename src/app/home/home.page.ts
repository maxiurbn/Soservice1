import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  userName: string | null = null;
  profilePhotoUrl: string | null = null;
  trabajosPosteados: any[] = [];
  comunas: string = ''; // Comuna actual del usuario
  searchQuery: string = '';
  comunasDisponibles: string[] = [
    'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
    'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
    'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
    'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén',
    'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta',
    'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago', 'Vitacura'
  ];

  constructor(
    private authService: AuthenticationService,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar el estado de autenticación para cargar los datos del usuario
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.loadUserData(user.uid); // Cargar datos del usuario si está autenticado
      } else {
        this.router.navigate(['/login']); // Redirigir al login si no está autenticado
      }
    });
    this.getTrabajosPosteados(); // Obtener trabajos al iniciar
  }

  async loadUserData(userId: string) {
    try {
      const userDataSnapshot = await this.db.database.ref(`users/${userId}`).once('value');
      if (userDataSnapshot.exists()) {
        const data = userDataSnapshot.val();
        this.userName = data.name || 'Usuario';
        this.profilePhotoUrl = data.profilePhotoUrl || 'assets/default.jpg'; // Imagen por defecto si no hay foto
        this.comunas = data.comunas || ''; // Asignar comuna del usuario
        this.getTrabajosPosteados(); // Filtrar trabajos según la comuna
      } else {
        console.error('El usuario no existe en la base de datos.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  getTrabajosPosteados() {
    this.db
      .list('trabajosPosteados')
      .snapshotChanges()
      .subscribe((trabajos: any[]) => {
        this.trabajosPosteados = trabajos.map((trabajo) => {
          const data = trabajo.payload.val();
          const id = trabajo.payload.key;
          return { id, ...data };
        });
  
        // Filtrar los trabajos por comuna del usuario y estado "pendiente"
        this.trabajosPosteados = this.trabajosPosteados.filter(
          (trabajo) =>
            trabajo.estado === 'pendiente' &&
            (!this.comunas || trabajo.comunas === this.comunas) // Comprobar también si la comuna coincide
        );
  
        // Agregar nombres de los creadores
        this.trabajosPosteados.forEach((trabajo) => {
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
  goToCrearServicio() {
    this.router.navigate(['/crear-servicio']);
  }

  // Función para cambiar la comuna manualmente
  cambiarComuna(nuevaComuna: string) {
    this.comunas = nuevaComuna;
    this.getTrabajosPosteados(); // Recargar los trabajos filtrados por la nueva comuna seleccionada
  }

  cargarTrabajos() {
    this.db.list('trabajosPosteados').valueChanges().subscribe((trabajos: any[]) => {
      this.trabajosPosteados = trabajos;
    });
  }

  buscarTrabajos() {
    // Redirige a la página de resultados con la búsqueda y comuna como parámetros
    this.router.navigate(['/resultadobusqueda'], {
      queryParams: {
        query: this.searchQuery,
      },
    });
  }
}
