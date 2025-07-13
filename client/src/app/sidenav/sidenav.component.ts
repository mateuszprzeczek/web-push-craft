import {Component, inject, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AuthService} from '../auth/services/auth.service';
import {TranslateModule} from '@ngx-translate/core';
import {TranslationService} from '../i18n/translation.service';
import {GetStartedDialogComponent} from '../get-started-dialog/get-started-dialog.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    TranslateModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  dialog = inject(MatDialog);

  languages = this.translationService.getLanguages();

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  changeLanguage(lang: string): void {
    this.translationService.setLanguage(lang);
  }

  logout() {
    this.authService.logout();
  }

  openGetStartedDialog(): void {
    this.dialog.open(GetStartedDialogComponent, {
      width: '600px',
      panelClass: 'get-started-dialog'
    });
  }
}
