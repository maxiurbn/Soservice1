import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../common/services/authentication.service'; 
import { AlertController } from '@ionic/angular';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-admin-trabajos',
  templateUrl: './admin-trabajos.page.html',
  styleUrls: ['./admin-trabajos.page.scss'],
})
export class AdminTrabajosPage implements OnInit {
  trabajos: any[] = []; // Lista de trabajos

  constructor(
    private authService: AuthenticationService,
    private alertCtrl: AlertController,
    private router:Router
  ) {}

  ngOnInit() {
    this.loadTrabajos();
  }

  // Cargar trabajos desde Firebase
  loadTrabajos() {
    this.authService.getTrabajos().subscribe((data) => {
      this.trabajos = data.map((trabajo: any) => ({
        ...trabajo,
        key: trabajo.id, // Asegúrate de que el servicio ya devuelve la clave como `id`
      }));
    });
  }
  

  // Mostrar modal para editar un trabajo
  async showEditModal(trabajo: any) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Trabajo',
      inputs: [
        { name: 'categoria', type: 'text', value: trabajo.categoria, placeholder: 'Categoría' },
        { name: 'descripcionTrabajo', type: 'text', value: trabajo.descripcionTrabajo, placeholder: 'Descripción del trabajo' },
        { name: 'estado', type: 'text', value: trabajo.estado, placeholder: 'Estado (ej. Activo, Inactivo)' },
        { name: 'pago', type: 'text', value: trabajo.pago, placeholder: 'Pago ($)' },
        { name: 'requerimientos', type: 'text', value: trabajo.requerimientos, placeholder: 'Requerimientos' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Actualizar',
          handler: (data) => {
            if (trabajo.key) {
              this.authService.updateTrabajo(trabajo.key, data).then(() => {
                this.loadTrabajos(); // Recargar lista después de actualizar
              }).catch((error) => {
                console.error('Error al actualizar el trabajo:', error);
              });
            } else {
              console.error('Clave del trabajo no encontrada');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  

  // Confirmar eliminación
  async confirmDelete(key: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Estás seguro de que deseas eliminar este trabajo?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.deleteTrabajo(key);
          },
        },
      ],
    });

    await alert.present();
  }

  // Eliminar trabajo
  deleteTrabajo(key: string) {
    this.authService.deleteTrabajo(key).then(() => {
      this.loadTrabajos(); // Recargar lista después de eliminar
    });
  }
  goToAdmin() {
    this.router.navigate(['/admin']);
  }
  
}
