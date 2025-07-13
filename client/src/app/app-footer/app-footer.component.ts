import { Component, inject } from '@angular/core';
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { TranslationService } from "../i18n/translation.service";

@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslateModule],
  templateUrl: './app-footer.component.html',
  styleUrl: './app-footer.component.scss'
})
export class AppFooterComponent {
  readonly translationService = inject(TranslationService);
}
