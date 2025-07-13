import {Component, inject} from '@angular/core';

import {RouterOutlet} from '@angular/router';
import {AppFooterComponent} from "./app-footer/app-footer.component";
import {AuthService} from "./auth/services/auth.service";
import {CommonModule} from "@angular/common";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {SidenavComponent} from "./sidenav/sidenav.component";

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    AppFooterComponent,
    MatSidenavModule,
    MatButtonModule,
    SidenavComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'client';
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
