import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';

interface ChatMessage {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

interface Contact {
  creadorId: string;
  messages: ChatMessage[];
  otherUserId: string;
  lastMessage: ChatMessage | null;
  otherUserName: string;
  tipo: string;
}

@Component({
  selector: 'app-workplace',
  templateUrl: './workplace.page.html',
  styleUrls: ['./workplace.page.scss'],
})
export class WorkplacePage implements OnInit {
  currentUserId: string | null = null;
  workplaceContacts: Contact[] = [];

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router
  ) {}

  ngOnInit() {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.afAuth.currentUser.then((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.loadWorkplaceContacts();
      }
    });
  }

  loadWorkplaceContacts() {
    this.db.object(`contactos/${this.currentUserId}`).valueChanges().subscribe((contactosData: any) => {
      this.workplaceContacts = [];

      if (contactosData) {
        Object.keys(contactosData).forEach(contactoId => {
          const contacto = contactosData[contactoId];

          if (contacto && contacto.tipos) {
            const otherUserId = contactoId === this.currentUserId ? contacto.creadorId : contactoId;
            const lastMessage = contacto.messages ? contacto.messages[contacto.messages.length - 1] : null;

            // Obtener el nombre del otro usuario
            this.db.object(`users/${otherUserId}`).valueChanges().subscribe((user: any) => {
              const tipoContacto = contacto.tipos[otherUserId];

              // Filtrar solo contactos donde los demás están interesados
              if (tipoContacto === 'interesado') {
                this.workplaceContacts.push({
                  creadorId: contacto.creadorId,
                  messages: contacto.messages || [],
                  otherUserId: otherUserId,
                  lastMessage: lastMessage,
                  otherUserName: user?.name || 'Usuario',
                  tipo: tipoContacto,
                });
              }
            });
          }
        });
      }
    });
  }

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

  createChatId(userId1: string, userId2: string): string {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
  }
}
