import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/services/authentication.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.page.html',
  styleUrls: ['./admin-users.page.scss'],
})
export class AdminUsersPage implements OnInit {
  users: any[] = []; // Lista de usuarios

  constructor(
    private authService: AuthenticationService,
    private alertCtrl: AlertController,
    private router : Router,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Cargar usuarios desde Realtime Database
  loadUsers() {
    this.authService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  // Confirmar eliminación de un usuario (incluyendo datos y cuenta)
  async confirmDelete(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar al usuario ${user.name}? Esta acción eliminará todos los datos y la cuenta.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteUser(user.key); // Usa la clave del usuario (key) para eliminar los datos y la cuenta
          },
        },
      ],
    });

    await alert.present();
  }

  // Eliminar usuario (datos de Realtime Database y cuenta en Firebase Authentication)
  deleteUser(uid: string) {
    this.authService
      .deleteUser(uid)
      .then(() => {
        console.log('Usuario eliminado correctamente');
        this.loadUsers(); // Recargar lista de usuarios después de la eliminación
      })
      .catch((error) => {
        console.error('Error al eliminar el usuario:', error);
      });
  }
  goToAdmin() {
    this.router.navigate(['/admin']);
  }
  
}


