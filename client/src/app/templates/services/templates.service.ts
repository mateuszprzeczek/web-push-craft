import { inject, Injectable } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../../firebase/firebase.init';
import { AuthService } from '../../auth/services/auth.service';
import { PushNotification } from '../../creator/model/interfaces/push-notification.interface';
import { TranslateService } from '@ngx-translate/core';

// Extended interface that includes id and name fields
interface PushNotificationTemplate extends PushNotification {
  id: string;
  name: string;
}

@Injectable()
export class TemplatesService {
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  async loadTemplatesForCurrentUser(): Promise<Array<PushNotificationTemplate>> {
    console.log('loadTemplatesForCurrentUser called');
    const uid = this.authService.userUid();
    console.log('User UID:', uid);
    if (!uid) throw new Error(this.translate.instant('templates.errors.userNotLoggedIn'));

    console.log('Firestore path:', `users/${uid}/templates`);
    const templatesRef = collection(firestore, 'users', uid, 'templates');
    const snapshot = await getDocs(templatesRef);
    console.log('Snapshot size:', snapshot.size);

    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as PushNotificationTemplate));
    console.log('Templates:', templates);
    return templates;
  }
}
