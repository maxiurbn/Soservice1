import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { NavController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';

// Define la estructura del mensaje
interface ChatMessage {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  tipo: string; // Añadir tipo de usuario (interesado o workplace)
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  chatId: string | null = null;
  currentUserId: string | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  otherUserId: string | null = null;
  otherUserName: string = '';
  tipoUsuario: string = ''; // 'interesado' o 'workplace'
  otherUserProfilePhotoUrl: string | null = null; // Nueva propiedad para la imagen de perfil

  constructor(
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentUserId = params['usuarioId'];
      this.otherUserId = params['creadorId'];
  
      // Crear el chatId solo una vez
      this.chatId = this.createChatId(this.currentUserId!, this.otherUserId!);
      
      if (this.chatId) {
        this.loadMessages();
        this.loadOtherUserName(); // Cargar el nombre del otro usuario
        this.loadUserType(); // Cargar el tipo de usuario
        this.loadOtherUserProfilePhoto(this.otherUserId); // Cargar la foto de perfil del otro usuario
      }
    });
  }
  
  // Función para crear el chatId
  createChatId(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  }
  
  // Cargar los mensajes del chat
  loadMessages() {
    if (!this.chatId) {
      return;
    }
    
  
    this.db.list(`chats/${this.chatId}/messages`).valueChanges().subscribe((messages: any[]) => {
      this.messages = messages
        .filter(msg => typeof msg === 'object' && msg !== null)
        .map(msg => msg as ChatMessage);
  
      // Ordenar los mensajes por timestamp para mostrar en el orden correcto
      this.messages.sort((a, b) => a.timestamp - b.timestamp);
    });
  }

  // Cargar el nombre del otro usuario
  loadOtherUserName() {
    if (!this.otherUserId) return; // Verifica que existe otro usuario

    this.db.object(`users/${this.otherUserId}`).valueChanges().subscribe((user: any) => {
      if (user) {
        this.otherUserName = user.name; // Asigna el nombre del otro usuario
      }
    });
  }

  // Cargar el tipo de usuario
  loadUserType() {
    this.db.object(`contactos/${this.currentUserId}/${this.otherUserId}/tipos`).valueChanges().subscribe((tipos: any) => {
      if (tipos) {
        this.tipoUsuario = tipos[this.currentUserId] || '';  // 'interesado' o 'workplace'
      }
    });
  }

  // Enviar un mensaje
  sendMessage() {
    if (!this.chatId || !this.newMessage.trim() || !this.otherUserId) {
      return;
    }
  
    const message: ChatMessage = {
      senderId: this.currentUserId!,
      receiverId: this.otherUserId,
      text: this.newMessage,
      timestamp: Date.now(),
      tipo: this.tipoUsuario, // Asegurarte de que `tipo` esté presente
    };
  
    this.db.list(`chats/${this.chatId}/messages`).push(message).then(() => {
      this.newMessage = ''; // Limpiar el campo de entrada después de enviar
    }).catch(error => {
      console.error("Error al enviar el mensaje:", error);
    });
  }
  
  
  // Volver a la página anterior
  goBack() {
    this.navCtrl.back();
  }
  
  loadOtherUserProfilePhoto(otherUserId: string) {
    if (!otherUserId) return; // Verificar que se proporcionó un ID válido
  
    this.db.object(`users/${otherUserId}/profilePhotoUrl`).valueChanges().subscribe((url) => {
      this.otherUserProfilePhotoUrl = url as string; // Asignar la URL de la foto de perfil
    });
  }
  
}
