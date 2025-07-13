import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {DashboardStats} from "../model/interfaces/dashboard-stats.interface";
import {doc, getDoc} from "firebase/firestore";
import firebase from "firebase/compat";
import { firestore } from '../../../firebase/firebase.init';
import DocumentData = firebase.firestore.DocumentData;
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class RestService {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);

  async fetchDashboardStats(uid: string): Promise<DashboardStats | undefined> {
    const docRef = doc(firestore, 'stats', uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error(this.translate.instant('webPushDashboard.errors.statsNotFound', { uid }));
    }

    return snapshot.data() as DashboardStats;
  }
}
