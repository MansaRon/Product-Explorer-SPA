import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/services/interceptor/auth/auth.interceptor';
import { errorInterceptor } from './core/services/interceptor/error/error.interceptor';
import { baseUrlInterceptor } from './core/services/interceptor/base-url/base-url.interceptor';
import { cachingInterceptor } from './core/services/interceptor/caching/caching.interceptor';
import { loadingInterceptor } from './core/services/interceptor/loading/loading.interceptor';
import { loggingInterceptor } from './core/services/interceptor/loggin/loggin.interceptor';
import { retryInterceptor } from './core/services/interceptor/retry/retry.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      // Will uncomment once I've intergrated with the backend and want to test the interceptors
      withInterceptors([
        //authInterceptor,
        //errorInterceptor,
        //loadingInterceptor,
        //loggingInterceptor,
        //retryInterceptor,
        //baseUrlInterceptor,
        //cachingInterceptor,
      ])
    ),
  ],
};
