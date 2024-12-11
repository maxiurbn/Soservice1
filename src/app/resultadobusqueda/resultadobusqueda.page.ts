import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';



@Component({
  selector: 'app-resultadobusqueda',
  templateUrl: './resultadobusqueda.page.html',
  styleUrls: ['./resultadobusqueda.page.scss'],
})
export class ResultadobusquedaPage implements OnInit {
  searchQuery: string = '';
  comuna: string = '';
  trabajosFiltrados: any[] = [];
  noResults: boolean = false;
  profilePhotoUrl: string | null = null;


  constructor(private route: ActivatedRoute, private db: AngularFireDatabase, private NavCtrl : NavController,    private router: Router

  )  {}

  ngOnInit() {
    // Obtiene los parámetros de búsqueda y comuna
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['query'] || '';
      this.comuna = params['comuna'] || ''; // Puede estar vacío
      this.filtrarTrabajos();
    });
  }

  async loadUserData(userId: string) {
    try {
      const userDataSnapshot = await this.db.database.ref(`users/${userId}`).once('value');
      if (userDataSnapshot.exists()) {
        const data = userDataSnapshot.val();
        this.profilePhotoUrl = data.profilePhotoUrl || 'assets/default.jpg'; // Imagen por defecto si no hay foto
      } else {
        console.error('El usuario no existe en la base de datos.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error);
    }
  }

  filtrarTrabajos() {
    if (!this.searchQuery.trim()) {
      this.trabajosFiltrados = [];
      this.noResults = true;
      return;
    }
    

    this.db
      .list('trabajosPosteados')
      .valueChanges()
      .subscribe((trabajos: any[]) => {
        this.trabajosFiltrados = trabajos.filter((trabajo) => {
          const matchDescripcion = trabajo.descripcion
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase());
          const matchDescripcionTrabajo = trabajo.descripcionTrabajo
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase());
          const matchCategoria = trabajo.categoria
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase());
          const matchComuna = !this.comuna || trabajo.comuna === this.comuna;

          // Incluye coincidencia con descripción, descripciónTrabajo o categoría
          return (matchDescripcion || matchDescripcionTrabajo || matchCategoria) && matchComuna;
        });

        this.noResults = this.trabajosFiltrados.length === 0;
      });
  }
  goBack() {
    this.NavCtrl.back();
  }
  goToDetalleTrabajo(trabajo: any) {
    this.router.navigate(['/detalle-trabajo'], { state: { trabajo } }); // Navegar a la página "Detalle Trabajo" con los datos del trabajo
  }
  
}
