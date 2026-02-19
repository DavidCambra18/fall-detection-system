import { Component, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';
import { ChatGPTService } from '../../../core/services/chatgpt.service';
import { AuthService } from '../../../core/services/auth.service';
import { MarkdownComponent } from 'ngx-markdown';

interface Message {
  text: string;
  sender: 'user' | 'ai';
  time: Date;
}

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [FormsModule, NgClass, DatePipe, MarkdownComponent],
  templateUrl: './chat-ai.html'
})
export class ChatAiComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private aiService = inject(ChatGPTService);
  public authService = inject(AuthService);

  isOpen = signal(false);
  isTyping = signal(false);
  newMessage = signal('');
  messages = signal<Message[]>([
    { text: '¡Hola! Soy tu asistente IA. ¿En qué puedo ayudarte hoy?', sender: 'ai', time: new Date() }
  ]);

  constructor() {
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text || this.isTyping()) return;

    this.addMessage(text, 'user');
    this.newMessage.set('');
    this.isTyping.set(true);

    this.aiService.ask(text).subscribe({
      next: (res) => this.addAIResponse(res.response),
      error: () => this.handleError()
    });
  }

  // ACCIÓN RÁPIDA: Solo Usuario (Rol 3)
  generateAIReport() {
    if (this.isTyping()) return;
    this.addMessage('Genera un reporte de mi actividad reciente.', 'user');
    this.isTyping.set(true);

    this.aiService.generateReport().subscribe({
      next: (res) => this.addAIResponse(res.report),
      error: () => this.handleError()
    });
  }

  // ACCIÓN RÁPIDA: Solo Usuario (Rol 3)
  getAISuggestions() {
    if (this.isTyping()) return;
    this.addMessage('Dame consejos de seguridad personalizados.', 'user');
    this.isTyping.set(true);

    this.aiService.getSuggestions().subscribe({
      next: (res) => this.addAIResponse(res.suggestions),
      error: () => this.handleError()
    });
  }

  // ACCIÓN RÁPIDA: Solo Cuidador (Rol 2) - ARREGLADO
  analyzeCaregiverPatients() {
    if (this.isTyping()) return;
    
    const user = this.authService.currentUser();
    
    // Lo que aparece en la burbuja de chat para el usuario
    this.addMessage('Analiza las incidencias de mis pacientes.', 'user');
    this.isTyping.set(true);

    // Prompt técnico "invisible" que fuerza a la IA a mirar la base de datos
    const technicalPrompt = `
      CONTEXTO DE SISTEMA: Eres un asistente de teleasistencia para el cuidador "${user?.name}".
      INSTRUCCIÓN: Accede a los registros de eventos, alertas y telemetría de los pacientes vinculados a este cuidador.
      TAREA: 
      1. Identifica caídas o botones de pánico activados hoy.
      2. Detecta si algún sensor lleva mucho tiempo sin enviar datos (inactividad).
      3. Resume el estado de salud general de los pacientes de forma ejecutiva.
      Si no ves datos, indica que los sensores están conectados pero no han registrado anomalías críticas.
      Usa formato Markdown profesional con iconos.
    `;

    this.aiService.ask(technicalPrompt).subscribe({
      next: (res) => this.addAIResponse(res.response),
      error: () => this.handleError()
    });
  }

  private addMessage(text: string, sender: 'user' | 'ai') {
    this.messages.update(prev => [...prev, { text, sender, time: new Date() }]);
  }

  private addAIResponse(text: string) {
    this.addMessage(text, 'ai');
    this.isTyping.set(false);
  }

  private handleError() {
    this.addAIResponse('Lo siento, el servicio de IA no está disponible ahora o no tiene acceso a los datos.');
    this.isTyping.set(false);
  }

  private scrollToBottom(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}