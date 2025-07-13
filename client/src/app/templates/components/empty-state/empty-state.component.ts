import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() message: string = 'emptyState.defaultMessage';
  @Input() buttonText: string = 'emptyState.defaultButtonText';
  @Input() buttonLink: string = '/';
  @Input() icon: string = 'add_circle';
}
