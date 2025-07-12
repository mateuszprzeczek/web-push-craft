import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {from, Observable} from 'rxjs';
import {DashboardStats} from "../model/interfaces/dashboard-stats.interface";
import {doc, getDoc} from "firebase/firestore";
import firebase from "firebase/compat";
import { firestore } from '../../../firebase/firebase.init';
import DocumentData = firebase.firestore.DocumentData;

@Injectable()
export class RestService {
  private http = inject(HttpClient);

  async fetchDashboardStats(uid: string): Promise<DashboardStats | undefined> {
    const docRef = doc(firestore, 'stats', uid);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      throw new Error('Stats not found for user: ' + uid);
    }

    return snapshot.data() as DashboardStats;
  }
}
