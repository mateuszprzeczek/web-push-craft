import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { routes } from './app.routes';
import {AuthService} from "./auth/services/auth.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    AuthService,
    importProvidersFrom(
      MatCardModule,
      MatToolbarModule,
      MatProgressSpinnerModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      FormsModule,
    ),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),
  ]
};
