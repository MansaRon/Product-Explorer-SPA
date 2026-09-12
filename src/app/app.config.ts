import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/services/interceptor/auth/auth.interceptor';
import { baseUrlInterceptor } from './core/services/interceptor/base-url/base-url.interceptor';
import { retryInterceptor } from './core/services/interceptor/retry/retry.interceptor';
import { loadingInterceptor } from './core/services/interceptor/loading/loading.interceptor';
import { errorInterceptor } from './core/services/interceptor/error/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor,
        //loggingInterceptor,
        retryInterceptor,
        baseUrlInterceptor,
        //cachingInterceptor,
      ])
    ),
  ],
};
