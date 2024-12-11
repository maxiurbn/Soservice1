import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Pipe, PipeTransform } from '@angular/core';
import { take } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

// Define the ChatMessage interface to structure our messages
interface ChatMessage {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  tipo: string; // Añadir esta propiedad
}


// Define the Contact interface to structure our contacts
interface Contact {
  creadorId: string;
  interesadoId: string;
  messages: ChatMessage[];
  otherUserId: string;
  lastMessage: ChatMessage | null;
  otherUserName: string;
  botonEstado?: string;
  tipo: string;
  trabajoId?: string;
  contratado?: boolean;
  trabajoTitulo?: string;
  notificacionExistente?: boolean; // Nueva propiedad opcional
  trabajoFoto?: string; // Nueva propiedad
  trabajoCategoria?: string; // Nueva propiedad
}

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.page.html',
  styleUrls: ['./contactos.page.scss'],
})
export class ContactosPage implements OnInit {
  currentUserId: string | null = null;
  contactos: Contact[] = [];
  selectedRole: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private NavCtrl: NavController

  ) {}

  ngOnInit() {
    this.getCurrentUser();
  }

  // Obtener el usuario actual
  getCurrentUser() {
    this.afAuth.currentUser.then((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadContactos();
      }
    });
  }

  // Cargar contactos desde Firebase
// En la función loadContactos()
// Cargar contactos desde Firebase
// Lógica mejorada para obtener trabajoId y tipo sin suscripciones anidadas innecesarias
loadContactos() {
  if (!this.currentUserId) return;

  this.db.list('contactos').snapshotChanges().subscribe((contactosSnapshot: any[]) => {
    this.contactos = [];

    contactosSnapshot.forEach((snapshot) => {
      const contactoId = snapshot.key;
      const contactoData = snapshot.payload.val();

      if (contactoData) {
        const {
          creadorId,
          interesadoId,
          trabajoId,
          tipos,
          chatId,
          mensajeInicial,
          timestamp,
          trabajoTitulo,
          creadorNombre,
          interesadoNombre,
        } = contactoData;

        const tipoUsuario = tipos[this.currentUserId];
        const otherUserId = this.currentUserId === creadorId ? interesadoId : creadorId;
        const otherUserName = this.currentUserId === creadorId ? interesadoNombre : creadorNombre;

        if (tipoUsuario && otherUserId) {
          // Escuchar mensajes en tiempo real
          this.db.list(`chats/${chatId}/messages`).valueChanges().subscribe((mensajes: any[]) => {
            const userMessages: ChatMessage[] = mensajes.map((msg) => msg as ChatMessage);

            const lastMessage: ChatMessage = userMessages.length
              ? userMessages[userMessages.length - 1]
              : {
                  senderId: this.currentUserId!,
                  receiverId: otherUserId,
                  text: mensajeInicial || 'Sin mensaje',
                  timestamp: timestamp || Date.now(),
                  tipo: tipoUsuario,
                };

            // Escuchar notificaciones y datos del trabajo en tiempo real
            this.db.list(`notificaciones/${interesadoId}`, (ref) =>
              ref.orderByChild('trabajoId').equalTo(trabajoId)
            ).valueChanges().subscribe((notificaciones: any[]) => {
              this.db.object(`trabajosPosteados/${trabajoId}`).valueChanges().subscribe((trabajoData: any) => {
                const trabajadorContratadoId = trabajoData?.trabajadorContratado;
                const trabajoEstado = trabajoData?.estado;

                const trabajoFoto = trabajoData?.imageUrl || 'assets/default-job.png';
                const trabajoCategoria = trabajoData?.categoria || 'Sin categoría';

                // Determinar el estado del botón basado en notificaciones y estado del trabajo
                let botonEstado = 'contratar';
                const notificacionPendiente = notificaciones.find((n: any) => n.estado === 'pendiente');
                const notificacionAceptada = notificaciones.find((n: any) => n.estado === 'aceptado');
                const notificacionRechazada = notificaciones.find((n: any) => n.estado === 'rechazado');

                if (trabajadorContratadoId && trabajoEstado === 'en proceso') {
                  if (trabajadorContratadoId === interesadoId) {
                    botonEstado = 'trabajador-contratado';
                  } else {
                    botonEstado = 'trabajo-ocupado';
                  }
                } else if (notificacionAceptada) {
                  botonEstado = 'trabajador-contratado';
                } else if (notificacionPendiente) {
                  botonEstado = 'en-espera';
                } else if (notificacionRechazada) {
                  botonEstado = 'rechazado';
                }

                const contactoNuevo: Contact = {
                  creadorId: creadorId,
                  interesadoId: interesadoId,
                  messages: userMessages,
                  otherUserId: otherUserId,
                  lastMessage: lastMessage,
                  otherUserName: otherUserName,
                  trabajoId: trabajoId,
                  trabajoTitulo: trabajoTitulo || 'Sin título',
                  tipo: tipoUsuario,
                  trabajoFoto: trabajoFoto,
                  trabajoCategoria: trabajoCategoria,
                  botonEstado: botonEstado,
                };

                const index = this.contactos.findIndex((c) => c.trabajoId === trabajoId && c.otherUserId === otherUserId);
                if (index > -1) {
                  this.contactos[index] = contactoNuevo;
                } else {
                  this.contactos.push(contactoNuevo);
                }
              });
            });
          });
        }
      }
    });
  });
}






async contratarTrabajador(contacto: Contact) {
  if (!this.currentUserId || !contacto) {
    console.error('Faltan datos del usuario o del contacto.');
    return;
  }

  try {
    const trabajoSnapshot = await this.db.object(`trabajosPosteados/${contacto.trabajoId}`).query.once('value');
    const trabajoData = trabajoSnapshot.val();
    
    if (!trabajoData) {
      alert('El trabajo no existe.');
      return;
    }

    const { trabajadorContratado, estado } = trabajoData;

    if (trabajadorContratado && trabajadorContratado !== contacto.interesadoId) {
      alert('El trabajo ya está ocupado por otro trabajador.');
      return;
    }

    if (estado === 'cerrado') {
      alert('Este trabajo ya está cerrado y no se puede contratar.');
      return;
    }

    // Verificar notificaciones existentes
    const notificacionesSnap = await this.db.list(`notificaciones/${contacto.interesadoId}`).query.once('value');
    const notificaciones = notificacionesSnap.val() || {};
    const notificacionExistente = Object.values(notificaciones).some((n: any) => n.trabajoId === contacto.trabajoId);

    if (notificacionExistente) {
      alert('Ya existe una notificación para este trabajo.');
      return;
    }

    // Crear notificación
    const interesadoSnap = await this.db.object(`users/${contacto.interesadoId}`).query.once('value');
    const interesadoData = interesadoSnap.val();
    const interesadoNombre = interesadoData?.name || 'Sin Nombre';

    const notificacionRef = this.db.list(`notificaciones/${contacto.interesadoId}`).push({});
    const notificacionId = notificacionRef.key;

    await notificacionRef.set({
      id: notificacionId,
      trabajoId: contacto.trabajoId,
      interesadoId: contacto.interesadoId,
      interesadoNombre,
      creadorId: this.currentUserId,
      mensaje: '¡Felicidades! El creador quiere que trabajes en su proyecto. ¿Aceptas?',
      timestamp: Date.now(),
      tipo: 'contratacion',
      estado: 'pendiente'
    });

    // Actualizar trabajo
    await this.db.object(`trabajosPosteados/${contacto.trabajoId}`).update({
      trabajadorContratado: contacto.interesadoId,
      estado: 'en espera'
    });

    contacto.trabajoTitulo = 'En espera';
    contacto.notificacionExistente = true;

    alert('Notificación enviada, espera respuesta del interesado.');
  } catch (error) {
    console.error('Error al contratar:', error);
  }
}

  // Navegar al chat
  goToChat(otherUserId: string) {
    const chatId = this.createChatId(this.currentUserId, otherUserId);
    this.router.navigate(['/chat'], {
      queryParams: {
        usuarioId: this.currentUserId,
        creadorId: otherUserId,
        chatId: chatId
      }
    });
  }
  getButtonColor(contacto: Contact): string {
    if (contacto.contratado) return 'primary'; 
    return contacto.notificacionExistente ? 'medium' : 'success';
  }
  
  // Verificar si el botón debe estar deshabilitado
  isButtonDisabled(contacto: Contact): boolean {
    return contacto.notificacionExistente || false; 
  }
  
  // Obtener la etiqueta del botón
  getButtonLabel(contacto: Contact): string {
    if (contacto.contratado) return 'Trabajador Contratado'; 
    return contacto.notificacionExistente ? 'En espera' : 'Contratar';
  }

  createChatId(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  }

  goBack() {
    this.NavCtrl.back();
  }
}
