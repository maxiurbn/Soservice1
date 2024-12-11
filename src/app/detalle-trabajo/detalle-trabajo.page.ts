import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavController } from '@ionic/angular';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-trabajo',
  templateUrl: './detalle-trabajo.page.html',
  styleUrls: ['./detalle-trabajo.page.scss'],
})
export class DetalleTrabajoPage implements OnInit {
  trabajo: any;
  currentUserName: string | null = null;
  currentUserId: string | null = null;
  trabajoContratado: boolean = false;
  images: string[] = [];
  creadorProfilePhotoUrl: string | null = null;
  nombreCreador: string | null = null;
  esCreador: boolean = false;
  rating: number = 0; // Promedio de valoración
  ratingCount: number = 0; // Número total de valoraciones

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.initializeData();
    
    
  }
  
  goBack() {
    this.navCtrl.back();
  }

  async initializeData() {
    try {
      const navigation = this.router.getCurrentNavigation();
      this.trabajo = navigation?.extras?.state ? navigation.extras.state['trabajo'] : null;
  
      // Verificar si se pasó un ID de trabajo
      if (this.trabajo?.id) {
        // Obtener todos los datos del trabajo desde Firebase
        const trabajoData: any = await this.db
          .object(`trabajosPosteados/${this.trabajo.id}`)
          .valueChanges()
          .pipe(take(1))
          .toPromise();
  
        if (trabajoData) {
          // Fusionar los datos obtenidos desde Firebase con el trabajo existente
          this.trabajo = { ...this.trabajo, ...trabajoData };
          console.log('Estado del trabajo:', this.trabajo.estado); // Verificar estado en consola
          console.log('Título del trabajo:', this.trabajo.descripcionTrabajo); // Verificar título en consola
  
          // Preparar imágenes y verificar contratación
          this.prepareImages();
          this.checkContratacion();
        }
      }
  
      // Obtener el usuario actual en paralelo con la carga de datos del creador
      const tareas: Promise<any>[] = [this.getCurrentUser()];
      const user = await this.afAuth.currentUser;
      if (user) {
        this.currentUserId = user.uid;
        this.esCreador = this.trabajo?.creadorId === this.currentUserId; // Verificar si es el creador
      }
  
      // Cargar información adicional del creador si existe
      if (this.trabajo?.creadorId) {
        tareas.push(
          Promise.all([
            this.loadCreatorProfilePhoto(this.trabajo.creadorId),
            this.obtenerNombreCreador(this.trabajo.creadorId),
            this.loadCreatorRating(this.trabajo.creadorId),  // Cargar el rating del creador
          ])
        );
      }
  
      // Esperar a que todas las tareas terminen
      await Promise.all(tareas);
    } catch (error) {
      console.error('Error al inicializar los datos:', error);
    }
  }
  
  // Método para cargar el rating del creador
  async loadCreatorRating(creadorId: string) {
    if (creadorId) {
      this.db.object(`users/${creadorId}`).valueChanges().pipe(take(1)).subscribe((userData: any) => {
        if (userData) {
          this.rating = userData.rating || 0; // Obtener el rating del creador
          this.ratingCount = userData.ratingCount || 0; // Obtener el número de valoraciones del creador
          console.log('Rating del creador:', this.rating);
          console.log('Número de valoraciones del creador:', this.ratingCount);
        }
      });
    }
  }
  
  async obtenerNombreCreador(idCreador: string) {
    if (idCreador) {
      await this.db.object(`users/${idCreador}`).valueChanges().pipe(take(1)).toPromise().then((datosCreador: any) => {
        if (datosCreador) {
          this.nombreCreador = `${datosCreador.name} ${datosCreador.lastName} ${datosCreador.lastnamef}`;
          console.log('Nombre del creador:', this.nombreCreador); // Verificar nombre en consola
        }
      });
    }
  }
  
  // Obtener el usuario actual
  async getCurrentUser() {
    const user = await this.afAuth.currentUser;
    if (user) {
      this.currentUserId = user.uid;
      this.db.object(`users/${user.uid}`).valueChanges().pipe(take(1)).subscribe((userData: any) => {
        if (userData) {
          this.currentUserName = `${userData.name} ${userData.lastName} ${userData.lastnamef}`;
        }
      });
    }
  }
  

  checkContratacion() {
    if (this.trabajo?.id) {
      this.db.list(`notificaciones/${this.trabajo.creadorId}`).valueChanges().subscribe((notificaciones: any[]) => {
        const notificacionExistente = notificaciones.find((notificacion) => notificacion.trabajoId === this.trabajo.id && notificacion.trabajoContratado);
        if (notificacionExistente) {
          this.trabajoContratado = true; // Si existe una notificación de contratación, actualizar el estado
        }
      });
    }
  }
  loadCreatorProfilePhoto(creadorId: string) {
    this.db.object(`users/${creadorId}/profilePhotoUrl`).valueChanges().subscribe((url) => {
      this.creadorProfilePhotoUrl = url as string;
    });
  }

  // Expresar interés en el trabajo y notificar al creador
  expresarInteres() {
    if (this.currentUserName && this.currentUserId && this.trabajo.creadorId) {
      const notification = {
        trabajoId: this.trabajo.id || null,
        trabajoCategoria: this.trabajo.categoria,
        interesadoId: this.currentUserId,
        interesadoNombre: this.currentUserName,
        timestamp: Date.now(),
        tipo: 'interes',
        trabajoContratado: false
      };

      // Guardar la notificación en Firebase en la ruta del creador
      this.db.list(`notificaciones/${this.trabajo.creadorId}`).push(notification)
        .then(() => {
          alert('Se ha enviado una notificación al creador.');
          this.contactarCreador(this.trabajo.creadorId); // Llama al método para registrar el contacto
        })
        .catch((error) => {
          console.error('Error al enviar la notificación:', error);
        });
    } else {
      console.error('Información incompleta para enviar la notificación.');
    }
  }

  contactarCreador(creadorId: string) {
    if (this.currentUserName && this.currentUserId && this.trabajo) {
      const chatId = this.getChatId(this.currentUserId, creadorId, this.trabajo.id);
  
      // Verificar si el chat ya existe usando snapshotChanges()
      this.db.object(`chats/${chatId}`).snapshotChanges().pipe(
        take(1) // Tomar solo el primer valor
      ).subscribe(chatData => {
        if (chatData.payload.exists()) {
          // Si el chat ya existe, redirige al usuario al chat existente
          this.irAlChat(chatId);
        } else {
          const tipos = {
            [this.currentUserId]: 'interesado',
            [creadorId]: 'workplace'
          };
  
          // Crear el nuevo contacto en Firebase
          const nuevoContactoRef = this.db.list('contactos').push({});
          const contactoId = nuevoContactoRef.key;
  
          // Asegurar que `estado` se incluya correctamente en `contactoData`
          const contactoData = {
            id: contactoId,
            trabajoId: this.trabajo.id,
            trabajoTitulo: this.trabajo.descripcionTrabajo ?? 'Sin título',
            creadorId: creadorId,
            creadorNombre: this.trabajo.creadorNombre ?? 'Creador desconocido',
            interesadoId: this.currentUserId,
            interesadoNombre: this.currentUserName,
            tipos: tipos,
            chatId: chatId,
            mensajeInicial: 'Usuario quiere contactarte',
            timestamp: Date.now(),
            contratado: false,
            estado: this.trabajo.estado ?? 'pendiente' // <-- Confirmación del campo `estado`
          };
  
          // Guardar el contacto en Firebase
          nuevoContactoRef.set(contactoData).then(() => {
            console.log('Contacto creado exitosamente con estado:', contactoData.estado);
  
            // Crear el nodo del chat si no existe
            this.db.object(`chats/${chatId}`).set({
              usuarios: [this.currentUserId, creadorId],
              trabajoId: this.trabajo.id,
              trabajoTitulo: this.trabajo.titulo ?? 'Sin título',
              mensajes: []
            }).then(() => {
              this.irAlChat(chatId); // Redirigir al usuario al chat creado
            });
          }).catch((error) => {
            console.error('Error al crear el contacto:', error);
          });
        }
      });
    } else {
      console.error('Faltan datos para contactar al creador.');
    }
  }
  
  
  
  

 

  

  irAlChat(chatId: string) { // Modificado para recibir chatId
    if (this.currentUserId && this.trabajo && this.trabajo.creadorId) {
      this.router.navigate(['/chat'], {
        queryParams: {
          usuarioId: this.currentUserId,
          creadorId: this.trabajo.creadorId,
          otherUserId: this.trabajo.creadorId, 
          trabajoId: this.trabajo.id, // Asegúrate de que este ID sea correcto
          chatId: chatId // Pasar el chatId
        }
      });
    }
    
  }
  prepareImages() {
    if (this.trabajo) {
      this.images = [];
      if (this.trabajo.imageUrl) this.images.push(this.trabajo.imageUrl);
      if (this.trabajo.imageUrl2) this.images.push(this.trabajo.imageUrl2);
      if (this.trabajo.imageUrl3) this.images.push(this.trabajo.imageUrl3);
    }
  }

  getChatId(id1: string, id2: string, trabajoId: string): string {
    // Crear un ID único para el chat con los IDs de usuario, creador y trabajo
    const userPairId = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`; // Asegurar un orden consistente
    return `${userPairId}_${trabajoId}`; // Concatenar los IDs con un formato consistente
  }
  
  }
