import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TemplatesService } from './services/templates.service';
import { PushNotification } from '../creator/model/interfaces/push-notification.interface';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';

// Extended interface that includes id and name fields
interface PushNotificationTemplate extends PushNotification {
  id: string;
  name: string;
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, TranslateModule, EmptyStateComponent],
  providers: [TemplatesService],
  templateUrl: './templates.component.html',
  styles: [`
    .templates-card {
      margin-top: 1rem;
    }

    .template-item {
      background-color: #f8f9fa;
      transition: all 0.3s ease;
      color: #000; /* Add black text color */
    }

    .template-item:hover {
      background-color: #e9ecef;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `]
})
export class TemplatesComponent implements OnInit {
  templates: PushNotificationTemplate[] = [];
  private translate = inject(TranslateService);
  private router = inject(Router);

  constructor(private templatesService: TemplatesService) {}

  navigateToSend(templateId: string): void {
    console.log('navigateToSend called with templateId:', templateId);
    // Use navigateByUrl instead of navigate
    this.router.navigateByUrl(`/send/${templateId}`).then(
      success => console.log('Navigation success:', success),
      error => console.error('Navigation error:', error)
    );
  }

  ngOnInit(): void {
    this.templatesService.loadTemplatesForCurrentUser()
      .then(templates => {
        this.templates = templates;
        console.log('Templates:', templates);
      })
      .catch(err => {
        console.error(this.translate.instant('templates.errors.loadingTemplates'), err);
      });
  }
}
