// src/models/contact.model.ts

export interface Contact {
    creadorId: string;          // ID del chat o creador
    messages: ChatMessage[];    // Array de mensajes
    otherUserId: string;        // ID del otro usuario (interlocutor)
    lastMessage: ChatMessage | null; // Último mensaje (puede ser null si no hay mensajes)
    otherUserName: string;      // Nombre del otro usuario
    tipo: string;               // Tipo de contacto (e.g., 'interesado' o 'workplace')
  }
  export interface ChatMessage {
    senderId: string;      // ID del remitente
    receiverId: string;    // ID del destinatario
    text: string;          // Contenido del mensaje
    timestamp: number;     // Marca de tiempo del mensaje
  }