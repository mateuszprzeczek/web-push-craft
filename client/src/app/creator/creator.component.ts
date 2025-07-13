import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase.init';
import { v4 as uuidv4 } from 'uuid';
import { PushNotification, NotificationAction } from './model/interfaces/push-notification.interface';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-creator',
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
    MatTooltipModule,
    TranslateModule
  ],
  providers: [AuthService],
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})
export class CreatorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private authService = inject(AuthService);

  templateForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    title: ['', [Validators.required]],
    body: ['', [Validators.required]],
    icon: [''],
    btn1Title: [''],
    btn1Url: [''],
    btn2Title: [''],
    btn2Url: [''],
    badge: [''],
    image: [''],
    tag: ['']
  });

  isSubmitting = false;
  isDraggingIcon = false;
  isDraggingImage = false;

  // Track if buttons are visible
  isButton1Visible = false;
  isButton2Visible = false;

  // Handle drag events for icon
  onDragOverIcon(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingIcon = true;
  }

  onDragLeaveIcon(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingIcon = false;
  }

  onDropIcon(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingIcon = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.readFileAsDataURL(file, 'icon');
      }
    }
  }

  // Handle drag events for image
  onDragOverImage(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = true;
  }

  onDragLeaveImage(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;
  }

  onDropImage(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.readFileAsDataURL(file, 'image');
      }
    }
  }

  // Read file as data URL and set form value
  private readFileAsDataURL(file: File, fieldName: 'icon' | 'image') {
    const reader = new FileReader();
    reader.onload = () => {
      this.templateForm.get(fieldName)?.setValue(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async saveTemplate() {
    if (this.templateForm.invalid) {
      this.markFormGroupTouched(this.templateForm);
      return;
    }

    this.isSubmitting = true;

    try {
      const templateId = uuidv4();
      const formValues = this.templateForm.value;

      // Create notification data according to PushNotification interface
      const pushNotification: PushNotification = {
        title: formValues.title,
        options: {
          body: formValues.body,
          icon: formValues.icon,
          ...(formValues.image ? { image: formValues.image } : {}),
          requireInteraction: true,
          data: {
            pushId: Date.now(),
            targetUrl: formValues.btn1Url || '',
            templateId: templateId,
            webPushMessageIntId: Math.floor(Math.random() * 1000000),
            ...this.getActionsField(formValues)
          }
        },
        createdAt: new Date().toISOString(),
        createdBy: this.authService.userUid() || 'unknown',
        status: 'draft',
        siteId: this.authService.userUid() || 'unknown'
      };

      // Add template name separately as it's not part of the PushNotification interface
      const templateData = {
        id: templateId,
        name: formValues.name,
        ...pushNotification
      };

      const uid = this.authService.userUid();

      console.log('this.authService.userUid()', this.authService.userUid())
      if (!uid) throw new Error('No UID found');

      await setDoc(doc(firestore, 'users', uid, 'templates', templateId), templateData);

      this.snackBar.open(
        this.translate.instant('creator.saveSuccess'),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );

      this.router.navigate(['/templates']);
    } catch (error) {
      console.error('Error saving template:', error);
      this.snackBar.open(
        this.translate.instant('creator.saveError'),
        this.translate.instant('common.close'),
        { duration: 3000 }
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  private createActionsArray(formValues: any): Array<NotificationAction> | undefined {
    const actions: Array<NotificationAction> = [];

    if (formValues.btn1Title && formValues.btn1Url) {
      actions.push({
        action: 'BTN1',
        title: formValues.btn1Title,
        url: formValues.btn1Url
      });
    }

    if (formValues.btn2Title && formValues.btn2Url) {
      actions.push({
        action: 'BTN2',
        title: formValues.btn2Title,
        url: formValues.btn2Url
      });
    }

    return actions.length > 0 ? actions : undefined;
  }

  private getActionsField(formValues: any): { actions: Array<NotificationAction> } | {} {
    const actions = this.createActionsArray(formValues);
    return actions ? { actions } : {};
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // Methods to handle adding and removing buttons
  addButton1() {
    this.isButton1Visible = true;
  }

  removeButton1() {
    this.isButton1Visible = false;
    this.templateForm.get('btn1Title')?.setValue('');
    this.templateForm.get('btn1Url')?.setValue('');
  }

  addButton2() {
    this.isButton2Visible = true;
  }

  removeButton2() {
    this.isButton2Visible = false;
    this.templateForm.get('btn2Title')?.setValue('');
    this.templateForm.get('btn2Url')?.setValue('');
  }

  // Check if buttons have values to determine visibility on component initialization
  ngOnInit() {
    const btn1Title = this.templateForm.get('btn1Title')?.value;
    const btn1Url = this.templateForm.get('btn1Url')?.value;
    const btn2Title = this.templateForm.get('btn2Title')?.value;
    const btn2Url = this.templateForm.get('btn2Url')?.value;

    this.isButton1Visible = !!(btn1Title || btn1Url);
    this.isButton2Visible = !!(btn2Title || btn2Url);

    // Log the userUid to confirm it's working
    console.log('ngOnInit - this.authService.userUid():', this.authService.userUid());
  }
}
