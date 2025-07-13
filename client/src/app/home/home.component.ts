import {Component, inject} from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatButton} from "@angular/material/button";
import {AuthService} from "../auth/services/auth.service";
import {TranslateModule} from "@ngx-translate/core";
import {TranslationService} from "../i18n/translation.service";

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    MatButton,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styles: `
    :host {
      .home-logo {
        max-height: 120px;
      }
    }`
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  readonly translationService = inject(TranslationService);
}
