import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

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

  template = signal<PushNotificationTemplate | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);

  subscriberCount = signal(0);
  isLoadingSubscribers = signal(false);

  sendForm: FormGroup = this.fb.group({
    sendType: ['now'],
    scheduledTime: [null]
  });

  sendType = toSignal(this.sendForm.get('sendType')!.valueChanges, { initialValue: this.sendForm.get('sendType')!.value });
  showDatePicker = computed(() => this.sendType() === 'schedule');

  ngOnInit(): void {
    const templateId = this.route.snapshot.paramMap.get('id');
    if (!templateId) {
      this.router.navigate(['/templates']);
      return;
    }

    this.loadTemplate(templateId);

    this.loadSubscriberCount();
  }

  async loadSubscriberCount(): Promise<void> {
    this.isLoadingSubscribers.set(true);
    try {
      const count = await this.sendService.getSubscriberCount();
      this.subscriberCount.set(count);
    } catch (error) {
      console.error('Error loading subscriber count:', error);
    } finally {
      this.isLoadingSubscribers.set(false);
    }
  }

  async recalculateSubscriberCount(): Promise<void> {
    this.isLoadingSubscribers.set(true);
    try {
      const count = await this.sendService.getSubscriberCount();
      this.subscriberCount.set(count);
      this.snackBar.open(
        this.translate.instant('send.subscribers.count', { count: this.subscriberCount() }),
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
      this.isLoadingSubscribers.set(false);
    }
  }

  private async loadTemplate(templateId: string): Promise<void> {
    try {
      const templates = await this.templatesService.loadTemplatesForCurrentUser();
      const found = templates.find(t => t.id === templateId) || null;
      this.template.set(found);
      this.isLoading.set(false);
    } catch (error) {
      console.error('Error loading template:', error);
      this.snackBar.open(
        this.translate.instant('templates.errors.loadingTemplates'),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );
      this.isLoading.set(false);
    }
  }

  async sendNotification(): Promise<void> {
    const tmpl = this.template();
    if (!tmpl) return;

    if (this.subscriberCount() === 0) {
      this.snackBar.open(
        this.translate.instant('send.errors.noSubscribers'),
        this.translate.instant('common.close'),
        { duration: 5000 }
      );
      return;
    }

    this.isSubmitting.set(true);
    const formValues = this.sendForm.value;

    try {
      if (formValues.sendType === 'now') {
        await this.sendService.sendNotificationNow(tmpl);
        this.snackBar.open(
          this.translate.instant('send.success'),
          this.translate.instant('common.close'),
          { duration: 3000 }
        );
      } else {
        await this.sendService.scheduleNotification(tmpl, formValues.scheduledTime);
        this.snackBar.open(
          this.translate.instant('send.scheduled'),
          this.translate.instant('common.close'),
          { duration: 3000 }
        );
      }
      this.router.navigate(['/templates']);
    } catch (error) {
      console.error('Error sending notification:', error);

      const errorMessage = error instanceof Error ? error.message : this.translate.instant('send.error');

      this.snackBar.open(
        errorMessage,
        this.translate.instant('common.close'),
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
