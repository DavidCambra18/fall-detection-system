import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';
import { provideMarkdown } from 'ngx-markdown';

import { 
  GoogleLoginProvider, 
  SocialAuthService,
  SocialAuthServiceConfig,
  SOCIAL_AUTH_CONFIG
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideMarkdown(),
    
    SocialAuthService,

    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              environment.googleClientId,
              {
                // DESACTIVA el popup automático (One Tap)
                oneTapEnabled: false, 
                // Indica que solo queremos el flujo de login clásico
                plugin_name: 'login' 
              }
            )
          }
        ],
        onError: (err: any) => console.error('Social Auth Error:', err)
      } as SocialAuthServiceConfig
    }
  ]
};