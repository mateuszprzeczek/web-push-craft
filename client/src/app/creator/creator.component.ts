import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase.init';
import { v4 as uuidv4 } from 'uuid';

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
    TranslateModule
  ],
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})
export class CreatorComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  templateForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    title: ['', [Validators.required]],
    body: ['', [Validators.required]],
    icon: [''],
    actionUrl: [''],
    badge: [''],
    image: [''],
    tag: ['']
  });

  isSubmitting = false;
  isDraggingIcon = false;
  isDraggingImage = false;

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
      const templateData = {
        id: templateId,
        ...this.templateForm.value,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, 'templates', templateId), templateData);

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

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
