import {Component} from '@angular/core';

import {RouterOutlet} from '@angular/router';
import {WebPushDashboardComponent} from "./web-push-dashboard/web-push-dashboard.component";
import {AppFooterComponent} from "./app-footer/app-footer.component";
import {AuthService} from "./auth/services/auth.service";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppFooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'client';
}
