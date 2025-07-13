import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SendService } from './services/send.service';
import { TemplatesService } from '../templates/services/templates.service';
import { PushNotification } from '../creator/model/interfaces/push-notification.interface';

// Extended interface that includes id and name fields
interface PushNotificationTemplate extends PushNotification {
  id: string;
  name: string;
}

@Component({
  selector: 'app-send',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    TranslateModule
  ],
  providers: [SendService, TemplatesService],
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private sendService = inject(SendService);
  private templatesService = inject(TemplatesService);

  template: PushNotificationTemplate | null = null;
  isLoading = true;
  isSubmitting = false;
  showDatePicker = false;

  // Subscriber count properties
  subscriberCount = 0;
  isLoadingSubscribers = false;

  sendForm: FormGroup = this.fb.group({
    sendType: ['now'], // 'now' or 'schedule'
    scheduledTime: [null]
  });

  ngOnInit(): void {
    console.log('SendComponent ngOnInit called');
    console.log('Route params:', this.route.snapshot.paramMap);
    const templateId = this.route.snapshot.paramMap.get('id');
    console.log('templateId:', templateId);
    if (!templateId) {
      console.log('No templateId found, navigating to /templates');
      this.router.navigate(['/templates']);
      return;
    }

    console.log('Loading template with ID:', templateId);
    this.loadTemplate(templateId);

    // Get subscriber count
    this.loadSubscriberCount();

    // Listen for changes to the sendType control
    this.sendForm.get('sendType')?.valueChanges.subscribe(value => {
      this.showDatePicker = value === 'schedule';
    });
  }

  /**
   * Load the subscriber count
   */
  async loadSubscriberCount(): Promise<void> {
    this.isLoadingSubscribers = true;
    try {
      this.subscriberCount = await this.sendService.getSubscriberCount();
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    } finally {
      this.isLoadingSubscribers = false;
    }
  }

  /**
   * Recalculate the subscriber count
   */
  async recalculateSubscriberCount(): Promise<void> {
    this.isLoadingSubscribers = true;
    try {
      this.subscriberCount = await this.sendService.getSubscriberCount();
      this.snackBar.open(
        this.translate.instant('send.subscribers.count', { count: this.subscriberCount }),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error recalculating subscriber count:', error);
      this.snackBar.open(
        this.translate.instant('send.error'),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.isLoadingSubscribers = false;
    }
  }

  private async loadTemplate(templateId: string): Promise<void> {
    console.log('loadTemplate called with templateId:', templateId);
    try {
      console.log('Loading templates for current user...');
      const templates = await this.templatesService.loadTemplatesForCurrentUser();
      console.log('Templates loaded:', templates);
      this.template = templates.find(t => t.id === templateId) || null;
      console.log('Template found:', this.template);
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading template:', error);
      this.snackBar.open(
        this.translate.instant('templates.errors.loadingTemplates'),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );
      this.isLoading = false;
    }
  }

  async sendNotification(): Promise<void> {
    if (!this.template) return;

    // Check if there are subscribers
    if (this.subscriberCount === 0) {
      this.snackBar.open(
        this.translate.instant('send.errors.noSubscribers'),
        this.translate.instant('common.close'),
        { duration: 5000 }
      );
      return;
    }

    this.isSubmitting = true;
    const formValues = this.sendForm.value;

    try {
      if (formValues.sendType === 'now') {
        await this.sendService.sendNotificationNow(this.template);
        this.snackBar.open(
          this.translate.instant('send.success'),
          this.translate.instant('common.close'),
          { duration: 3000 }
        );
      } else {
        await this.sendService.scheduleNotification(this.template, formValues.scheduledTime);
        this.snackBar.open(
          this.translate.instant('send.scheduled'),
          this.translate.instant('common.close'),
          { duration: 3000 }
        );
      }
      this.router.navigate(['/templates']);
    } catch (error) {
      console.error('Error sending notification:', error);

      // Check if it's a specific error
      const errorMessage = error instanceof Error ? error.message : this.translate.instant('send.error');

      this.snackBar.open(
        errorMessage,
        this.translate.instant('common.close'),
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting = false;
    }
  }
}
