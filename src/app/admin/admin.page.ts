import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  trabajosCount: number = 0;
  usersCount: number = 0;

  constructor(
    private AuthService: AuthenticationService,
    private router:Router) {}

  ngOnInit() {
    this.loadCounts();
  }

  async loadCounts() {
    try {
      this.trabajosCount = await this.AuthService.getTrabajosCount();
      this.usersCount = await this.AuthService.getUsersCount();
    } catch (error) {
      console.error('Error al cargar los conteos:', error);
    }
  }
  goToadminTrabajos() {
    this.router.navigate(['/admin-trabajos']);
  }
  goToadminUsuarios() {
    this.router.navigate(['/admin-users']);
  }
  goBack() {
    this.router.navigate(['perfil']); // Cambia 'home' por la ruta de la página que deseas regresar
  }
}