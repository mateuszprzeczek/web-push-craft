import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import {AuthService} from "../auth/services/auth.service";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-get-started-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule,
    MatSnackBarModule
  ],
  templateUrl: './get-started-dialog.component.html',
  styleUrls: ['./get-started-dialog.component.scss']
})
export class GetStartedDialogComponent {
  authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  uid = this.authService.userUid();

  constructor(public dialogRef: MatDialogRef<GetStartedDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  copyToClipboard(): void {
    const text = '<script data-id="wb-craft" async src="https://web-push-craft.web.app/webpush.js" data-uuid="'+this.uid+'"></script>';

    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open('Copied to clipboard', 'Close', {
        duration: 2000,
      });
    }, (err) => {
      console.error('Could not copy text: ', err);
      this.snackBar.open('Failed to copy', 'Close', {
        duration: 2000,
      });
    });
  }

  downloadServiceWorker(): void {
    const link = document.createElement('a');
    link.href = 'https://web-push-craft.web.app/sw-template/firebase-messaging-sw.zip';
    link.download = 'firebase-messaging-sw.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
