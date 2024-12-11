import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';  // Importa el Router
import { NavController } from '@ionic/angular';


@Component({
  selector: 'app-detallecontrato',
  templateUrl: './detallecontrato.page.html',
  styleUrls: ['./detallecontrato.page.scss'],
})
export class DetallecontratoPage implements OnInit {
  trabajoId: string | null = null;   // ID del trabajo
  trabajoDetalles: any = null;        // Detalles del trabajo
  userId: string | null = null;       // ID del usuario actual
  isCreator: boolean = false;         // Variable para verificar si es el creador
  private isUpdating: boolean = false;  
  hasWorker: boolean = false;// Flag para evitar recursión

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private alertController: AlertController,
    private toastCtrl: ToastController,  // Inyectamos ToastController
    private router: Router,  // Inyectamos Router,
    private NavCtrl: NavController

  ) {}

  ngOnInit() {
    // Obtener el userId del usuario actual
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid; // Guardamos el ID del usuario actual
        this.trabajoId = this.route.snapshot.paramMap.get('id'); // Obtener ID del trabajo desde la URL
        if (this.trabajoId) {
          this.getTrabajoDetalles(this.trabajoId); // Obtener detalles del trabajo
        }
      }
    });
  }

  // Obtener los detalles del trabajo desde Firebase
  getTrabajoDetalles(id: string) {
    this.db
      .object(`trabajosPosteados/${id}`)
      .valueChanges()
      .subscribe((data) => {
        this.trabajoDetalles = data;
  
        if (this.trabajoDetalles) {
          this.isCreator = this.trabajoDetalles.creadorId === this.userId; // Verificar si el usuario es el creador
          this.hasWorker = !!this.trabajoDetalles.trabajadorContratado; // Determinar si hay trabajador asignado
        }
      });
  }

  // Mostrar el pop-up de confirmación para finalizar el trabajo
  async showFinalizarTrabajoAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de que deseas finalizar este trabajo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        },
        {
          text: 'Sí',
          handler: () => {
            this.finalizarTrabajo();
          }
        }
      ]
    });
    await alert.present();
  }

  // Función para actualizar el estado del trabajo a "finalizado"
  finalizarTrabajo() {
    if (this.trabajoId) {
      const trabajoRef = this.db.object(`trabajosPosteados/${this.trabajoId}`);
      trabajoRef.update({
        estado: 'finalizado'  // Cambiamos el estado del trabajo
      }).then(() => {
        console.log('Trabajo finalizado');
        this.showRatingToast();  // Mostrar Toast para valorar el trabajo
      }).catch((error) => {
        console.error('Error al finalizar el trabajo: ', error);
      });
    }
  }
  deleteTrabajo() {
    if (this.trabajoId) {
      const trabajoRef = this.db.object(`trabajosPosteados/${this.trabajoId}`);
      trabajoRef
        .remove()
        .then(() => {
          console.log('Trabajo eliminado correctamente');
          this.router.navigate(['/home']); // Redirigir al usuario a la página principal
        })
        .catch((error) => {
          console.error('Error al eliminar el trabajo: ', error);
        });
    }
  }
  // Método para confirmar la eliminación del trabajo
async confirmDeleteTrabajo() {
  const alert = await this.alertController.create({
    header: 'Eliminar Trabajo',
    message: '¿Estás seguro de que deseas eliminar este trabajo? Esta acción no se puede deshacer.',
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Eliminación cancelada');
        },
      },
      {
        text: 'Eliminar',
        handler: () => {
          this.deleteTrabajo();
        },
      },
    ],
  });

  await alert.present();
}


  // Función para mostrar el Toast de valoración
  async showRatingToast() {
    const toast = await this.toastCtrl.create({
       
      cssClass: 'rating-toast', // Clase CSS para personalización
      buttons: [
        {
          text: '1⭐',
          handler: () => this.saveRating(1),
        },
        {
          text: '2⭐',
          handler: () => this.saveRating(2),
        },
        {
          text: '3⭐',
          handler: () => this.saveRating(3),
        },
        {
          text: '4⭐',
          handler: () => this.saveRating(4),
        },
        {
          text: '5⭐',
          handler: () => this.saveRating(5),
        },
      ],
      position: 'bottom', // Posiciona el toast en la parte inferior (opcional)
    });
  
    await toast.present();
  }

  // Función para guardar la valoración del trabajador (persona que toma el trabajo)
  saveRating(rating: number) {
    if (this.trabajoDetalles?.trabajadorContratado) {
      const trabajadorId = this.trabajoDetalles.trabajadorContratado; // ID del trabajador que toma el trabajo

      // Si ya estamos en proceso de actualización, no hacemos nada
      if (this.isUpdating) {
        return;
      }

      // Evitamos la recursión colocando la bandera a true
      this.isUpdating = true;

      // Acceder directamente al trabajador sin suscribirse a valueChanges
      const trabajadorRef = this.db.object(`users/${trabajadorId}`);

      // Usar once() para leer los valores una sola vez
      trabajadorRef.query.once('value').then(snapshot => {
        const userData = snapshot.val();  // Obtener los datos del trabajador

        if (userData) {
          const currentRating = userData?.rating || 0;
          const currentRatingCount = userData?.ratingCount || 0;

          // Calcular el nuevo rating promedio
          const newRatingCount = currentRatingCount + 1;
          const newRating = ((currentRating * currentRatingCount) + rating) / newRatingCount;

          // Actualizamos el rating y ratingCount solo una vez
          trabajadorRef.update({
            rating: newRating,
            ratingCount: newRatingCount
          }).then(() => {
            console.log('Valoración guardada correctamente');
            this.isUpdating = false;  // Restablecemos la bandera después de actualizar
            this.router.navigate(['/home']);  // Redirigimos a la página de inicio
          }).catch((error) => {
            console.error('Error al guardar la valoración: ', error);
            this.isUpdating = false;  // Restablecemos la bandera en caso de error
          });
        }
      }).catch((error) => {
        console.error('Error al obtener los datos del trabajador: ', error);
        this.isUpdating = false;  // Restablecemos la bandera en caso de error
      });
    }
  }
  goBack() {
    this.NavCtrl.back();
  }
}
