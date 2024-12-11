import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthenticationService } from '../common/services/authentication.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  profilePhotoUrl: string = 'assets/default.jpg';
  name: string = '';
  email: string = '';
  phone: string = '';
  comuna: string = ''; // Inicializar como vacío o por defecto la comuna del usuario
  comunas: string[] = [
    'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
    'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja',
    'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo',
    'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén',
    'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta',
    'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Santiago', 'Vitacura'
  ];
  isAdmin: Observable<boolean>;
  rating: number = 0; // Promedio de valoración
  ratingCount: number = 0; // Número total de valoraciones

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private NavCtrl: NavController,
    private router: Router,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.loadUserProfile(user.uid);
      } else {
        console.error("No hay usuario autenticado");
      }
    });

    this.isAdmin = this.authService.getCurrentUser().pipe(
      switchMap((user) => {
        if (user) {
          return from(this.authService.getUserData(user.uid)).pipe(
            map((userData: any) => userData?.role === 'admin')
          );
        }
        return from([false]); // Si no hay usuario, devuelve false
      })
    );
  }

  loadUserProfile(userId: string) {
    this.db.object(`users/${userId}`).valueChanges().subscribe(
      (userData: any) => {
        if (userData) {
          // Información básica del usuario
          this.name = userData.name || '';
          this.email = userData.email || '';
          this.phone = userData.phone || '';
          this.profilePhotoUrl = userData.profilePhotoUrl || 'assets/default.jpg';
          this.comuna = userData.comuna || '';

          // Información de la valoración
          this.rating = userData.rating || 0;
          this.ratingCount = userData.ratingCount || 0;
        }
      },
      (error) => console.error("Error al cargar los datos del perfil:", error)
    );
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  async logout() {
    try {
      await this.afAuth.signOut();
      console.log("Usuario deslogueado");
      this.router.navigate(['/login']);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  editProfile() {
    this.router.navigate(['/editarperfil']);
  }

  navigateToAdmin() {
    this.router.navigate(['/admin']);
  }
  
  goToHistorial() {
    this.router.navigate(['/historial']); 
  }

  goToPremium() {
    this.router.navigate(['/premium']); 
  }
}
