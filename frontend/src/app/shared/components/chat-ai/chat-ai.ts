import { Component, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  time: Date;
}

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe],
  templateUrl: './chat-ai.html'
})
export class ChatAiComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  isTyping = signal(false);
  newMessage = signal('');
  messages = signal<Message[]>([
    { text: 'Hola! Soy el asistente inteligente de Caete Tu. ¿Necesitas ayuda con los sensores o el historial?', sender: 'ai', time: new Date() }
  ]);

  // Efecto para hacer scroll al final cada vez que la lista de mensajes cambie
  constructor() {
    effect(() => {
      this.messages(); // Observamos el signal
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    // 1. Añadimos mensaje del usuario
    this.messages.update(prev => [...prev, { text, sender: 'user', time: new Date() }]);
    this.newMessage.set('');
    this.isTyping.set(true);
    
    // 2. Simulación de respuesta (Aquí conectarás tu API)
    setTimeout(() => {
      this.messages.update(prev => [...prev, { 
        text: 'Estoy analizando la telemetría del dispositivo ESP32-01. Todo parece estar dentro de los parámetros normales.', 
        sender: 'ai', 
        time: new Date() 
      }]);
      this.isTyping.set(false);
    }, 1500);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}