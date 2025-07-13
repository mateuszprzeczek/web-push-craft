import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatIconModule, TranslateModule],
  template: `
    <mat-card class="templates-card p-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <mat-card-title class="fs-3 mb-0">📝 {{ 'templates.title' | translate }}</mat-card-title>
        <a routerLink="/creator" class="btn btn-primary">
          <mat-icon class="me-1">add_circle</mat-icon>
          {{ 'templates.createNew' | translate }}
        </a>
      </div>
      <p>{{ 'templates.coming_soon' | translate }}</p>
    </mat-card>
  `,
  styles: [`
    .templates-card {
      margin-top: 1rem;
    }
  `]
})
export class TemplatesComponent {
}
