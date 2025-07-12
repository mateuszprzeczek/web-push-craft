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
  private readonly _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private readonly router = inject(Router);

  async register(email: string, password: string) {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credentials.user.uid;

      await setDoc(doc(firestore, 'users', uid), {
        uid,
        email,
        createdAt: new Date().toISOString(),
        isDemo: false,
      });

      this._isLoggedIn.set(true);
      console.log("User registered successfully.");
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  async login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      this._isLoggedIn.set(true);
      void this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  loginAsGuest() {
    this._isLoggedIn.set(true);
    void this.router.navigate(['/dashboard']);
  }

  async logout() {
    await signOut(auth);
    this._isLoggedIn.set(false);
    void this.router.navigate(['/']);
  }
}
