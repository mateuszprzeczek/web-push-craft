import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../../../firebase/firebase.init';

@Injectable()
export class AuthService {
  private readonly router = inject(Router);

  private readonly _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  private readonly _userUid = signal<string | null>(null);
  // readonly userUid = this._userUid.asReadonly();

  constructor() {
    // Initialize signals from localStorage
    const storedUid = localStorage.getItem('userUid');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (storedUid) {
      this._userUid.set(storedUid);
      console.log('Constructor - Initialized _userUid from localStorage:', storedUid);
    }

    if (isLoggedIn) {
      this._isLoggedIn.set(true);
      console.log('Constructor - Initialized _isLoggedIn from localStorage:', isLoggedIn);
    }
  }

  userUid(): string | null {
    // If auth.currentUser exists, use its uid
    if (auth.currentUser?.uid) {
      const uid = auth.currentUser.uid;
      console.log('userUid() - Using auth.currentUser.uid:', uid);
      return uid;
    }

    // Otherwise, return the value from the signal (which is initialized from localStorage)
    const uid = this._userUid();
    console.log('userUid() - Using _userUid():', uid);
    return uid;
  }


  async register(email: string, password: string) {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;

      this._userUid.set(uid);
      localStorage.setItem('userUid', uid);

      await setDoc(doc(firestore, 'users', uid), {
        uid,
        email,
        createdAt: new Date().toISOString(),
        isDemo: false,
      });

      this._isLoggedIn.set(true);
      localStorage.setItem('isLoggedIn', 'true');
      console.log("User registered successfully.");
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  async login(email: string, password: string) {
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;

      this._userUid.set(uid);
      localStorage.setItem('userUid', uid);

      this._isLoggedIn.set(true);
      localStorage.setItem('isLoggedIn', 'true');

      void this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  loginAsGuest() {
    this._isLoggedIn.set(true);
    localStorage.setItem('isLoggedIn', 'true');

    this._userUid.set('demo');
    localStorage.setItem('userUid', 'demo');

    console.log('this.userUid', this.userUid());
    void this.router.navigate(['/dashboard']);
  }

  async logout() {
    await signOut(auth);
    this._userUid.set(null);
    localStorage.removeItem('userUid');

    this._isLoggedIn.set(false);
    localStorage.removeItem('isLoggedIn');

    void this.router.navigate(['/']);
  }
}
