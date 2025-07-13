import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

import {provideHttpClient, withFetch, withInterceptorsFromDi} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from './i18n/translation.loader';

import { routes } from './app.routes';
import {AuthService} from "./auth/services/auth.service";
import {TranslationService} from "./i18n/translation.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    AuthService,
    TranslationService,
    importProvidersFrom(
      MatCardModule,
      MatToolbarModule,
      MatProgressSpinnerModule,
      MatButtonModule,
      MatFormFieldModule,
      MatInputModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      FormsModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: 'en'
      })
    ),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),
  ]
};
