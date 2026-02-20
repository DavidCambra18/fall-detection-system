import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink], // Importante para que funcione el botón que te lleva al login
  templateUrl: './welcome.html',
  styles: [`
    :host {
      display: block;
    }
    
    /* Pequeña animación de entrada para el título */
    h1 {
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px) skewY(2deg);
      }
      to {
        opacity: 1;
        transform: translateY(0) skewY(0);
      }
    }
  `]
})
export class WelcomeComponent {
  // No necesitamos lógica compleja aquí, es una página de aterrizaje
}