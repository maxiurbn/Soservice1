import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { NavController } from '@ionic/angular';



interface Notificacion {
  id: string;
  trabajoId?: string; // Campo opcional
  interesadoId?: string;
  interesadoNombre?: string;
  creadorId?: string;
  creadorNombre?: string;
  trabajoNombre?: string;
  mensaje?: string;
  timestamp?: number;
  tipo?: string;
  rolInteresado?: string;
  rolCreador?: string;
  trabajoContratado?: boolean;
  estado?: string; // 'pendiente', 'aceptado', 'rechazado', etc.
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  currentUserId: string | null = null;
  private notificacionesSubscription: Subscription | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private cdr: ChangeDetectorRef,
    private NavCtrl: NavController

  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.cargarNotificaciones();
      }
    });
  }

  cargarNotificaciones() {
    if (!this.currentUserId) {
      console.warn('Usuario no identificado, no se pueden cargar notificaciones.');
      return;
    }
  
    // Cancelar suscripción previa
    this.notificacionesSubscription?.unsubscribe();
  
    // Suscribirse a las notificaciones en tiempo real
    this.notificacionesSubscription = this.db
      .list(`notificaciones/${this.currentUserId}`)
      .snapshotChanges()
      .subscribe({
        next: (snapshots) => {
          const nuevasNotificaciones: Notificacion[] = [];
  
          snapshots.forEach((snapshot) => {
            const data = snapshot.payload.val() as Partial<Notificacion>;
            const id = snapshot.key!;
  
            if (data.trabajoId) {
              // Escuchar datos del trabajo en tiempo real
              this.db.object(`trabajosPosteados/${data.trabajoId}`).valueChanges().subscribe((trabajoData: any) => {
                const trabajoNombre = trabajoData?.descripcionTrabajo || 'Trabajo desconocido';
  
                if (
                  trabajoData?.estado === 'en proceso' &&
                  trabajoData?.trabajadorContratado &&
                  data.interesadoId === this.currentUserId &&
                  data.interesadoId !== trabajoData.trabajadorContratado
                ) {
                  const mensajeOcupado = `Lo sentimos, la vacante para el trabajo "${trabajoNombre}" ya ha sido ocupada.`;
  
                  // Actualizar mensaje en la base de datos si no está actualizado
                  if (data.mensaje !== mensajeOcupado) {
                    this.db.object(`notificaciones/${this.currentUserId}/${id}`).update({
                      mensaje: mensajeOcupado,
                      estado: 'informativo', // Cambiar el estado para ocultar botones
                    });
                  }
  
                  // Actualizar notificación localmente
                  nuevasNotificaciones.push({
                    id,
                    ...data,
                    mensaje: mensajeOcupado,
                    trabajoNombre,
                    creadorNombre: '',
                    estado: 'informativo', // Estado actualizado
                  });
                } else {
                  // Notificación sin cambios
                  nuevasNotificaciones.push({
                    id,
                    ...data,
                    trabajoNombre,
                    creadorNombre: '',
                  });
                }
  
                // Reemplazar notificaciones anteriores
                this.notificaciones = nuevasNotificaciones.filter(
                  (nueva, index, self) => self.findIndex((t) => t.id === nueva.id) === index
                );
  
                // Actualizar la vista
                this.cdr.detectChanges();
              });
            } else {
              // Manejo de notificaciones sin trabajoId
              nuevasNotificaciones.push({
                id,
                ...data,
                trabajoNombre: 'Trabajo desconocido',
                creadorNombre: '',
              });
            }
          });
  
          // Reemplazar notificaciones anteriores
          this.notificaciones = nuevasNotificaciones.filter(
            (nueva, index, self) => self.findIndex((t) => t.id === nueva.id) === index
          );
  
          // Actualizar la vista
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Error al cargar notificaciones:', error),
      });
  }
  
  
  
  

  obtenerCreadorNombreSync(creadorId: string): string {
    let creadorNombre = 'Creador desconocido';
  
    this.db.object(`users/${creadorId}`).valueChanges().pipe(take(1)).subscribe((userData: any) => {
      if (userData) {
        creadorNombre = `${userData.name || ''} ${userData.lastName || ''} ${userData.lastnamef || ''}`.trim();
      }
    });
  
    return creadorNombre;
  }
  obtenerCreadorNombre(creadorId: string): Promise<string> {
    if (!creadorId) {
      return Promise.resolve('Creador desconocido');
    }
  
    return this.db
      .object(`users/${creadorId}`)
      .query.once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        if (!data) {
          console.warn(`No se encontró el usuario con ID ${creadorId}`);
          return 'Creador sin nombre';
        }
  
        // Formar el nombre completo utilizando las claves name, lastName y lastnamef
        const { name = '', lastName = '', lastnamef = '' } = data;
        const nombreCompleto = `${name} ${lastName} ${lastnamef}`.trim();
        return nombreCompleto || 'Creador sin nombre';
      })
      .catch((error) => {
        console.error(`Error al obtener el nombre del creador con ID ${creadorId}:`, error);
        return 'Error al cargar nombre';
      });
  }
  

  gestionarSolicitud(notificacion: Notificacion, accion: 'aceptar' | 'rechazar') {
    if (notificacion.estado !== 'pendiente') {
      alert('La solicitud ya fue procesada.');
      return;
    }

    const nuevoEstado = accion === 'aceptar' ? 'aceptado' : 'rechazado';
    const mensaje = `${notificacion.interesadoNombre} ${
      accion === 'aceptar' ? 'aceptó' : 'rechazó'
    } el trabajo "${notificacion.trabajoNombre}"`;

    // Actualizar la notificación original
    const notificacionPath = `notificaciones/${this.currentUserId}/${notificacion.id}`;
    this.db
      .object(notificacionPath)
      .update({ estado: nuevoEstado })
      .then(() => {
        if (accion === 'aceptar') {
          // Actualizar el trabajo si se aceptó la solicitud
          const trabajoPath = `trabajosPosteados/${notificacion.trabajoId}`;
          return this.db.object(trabajoPath).update({
            trabajadorContratado: this.currentUserId,
            estado: 'en proceso',
          });
        }
      })
      .then(() => {
        // Crear una nueva notificación para el creador
        const nuevaNotificacion = {
          mensaje,
          timestamp: Date.now(),
          tipo: 'respuesta',
          estado: 'informativo',
          trabajoId: notificacion.trabajoId, // Aseguramos que trabajoId esté presente
        };
        return this.db.list(`notificaciones/${notificacion.creadorId}`).push(nuevaNotificacion);
      })
      .then(() => {
        alert(`Solicitud ${nuevoEstado}.`);
        this.cargarNotificaciones(); // Recargar notificaciones
      })
      .catch((error) => {
        console.error(`Error al ${accion} la solicitud:`, error);
        alert('Ocurrió un error al procesar la solicitud.');
      });
  }

  ngOnDestroy() {
    this.notificacionesSubscription?.unsubscribe(); // Liberar la suscripción
  }
  goBack() {
    this.NavCtrl.back();
  }
  limpiarNotificaciones() {
    if (!this.currentUserId) {
      console.warn('Usuario no identificado. No se pueden borrar notificaciones.');
      return;
    }
  
    const confirmacion = confirm('¿Estás seguro de que deseas borrar todas las notificaciones?');
    if (!confirmacion) return;
  
    this.db
      .list(`notificaciones/${this.currentUserId}`)
      .remove()
      .then(() => {
        this.notificaciones = []; // Limpiar la lista local
        this.cdr.detectChanges();
        alert('Todas las notificaciones han sido borradas.');
      })
      .catch((error) => {
        console.error('Error al borrar notificaciones:', error);
        alert('Ocurrió un error al intentar borrar las notificaciones.');
      });
  }
  
}