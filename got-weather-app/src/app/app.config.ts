import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor'; // adjust path if needed

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  //provideHttpClient(withInterceptors([authInterceptor]))
<<<<<<< HEAD
  
  // turn on standalone HttpClient + let DI supply ANY HTTP_INTERCEPTORS
  provideHttpClient(withInterceptorsFromDi()),

  // register your class-based interceptor
  {
    provide:  HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi:    true
  }
]
=======
  provideHttpClient(withInterceptorsFromDi()),
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
  ]
>>>>>>> revert-to-9155196f
};
