import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firebaseConfig } from '../environments/environment';
import { initializeApp } from 'firebase/app';
import { FirebaseError } from 'firebase/app';

import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  User,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthCredential,
  UserCredential
} from 'firebase/auth';

export interface Identity {
  email: string;
  given_name: string;
  picture: string;
  name: string;
}

// Initialize Firebase once for the whole app.
const app = initializeApp(firebaseConfig);

// Create the shared Firebase Auth instance used by this service.
const auth = getAuth(app);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cached UI-friendly version of the signed-in Firebase user.
  private cachedIdentity = new BehaviorSubject<Identity | null>(null);

  // Lets components know when the first auth state check has completed.
  private authReady = new BehaviorSubject<boolean>(false);

  constructor() {
    // Firebase restores the session asynchronously on page load,
    // so we listen here and update local reactive state when it finishes.
    onAuthStateChanged(auth, (user: User | null) => {
      console.log('new user');
      console.log(user);
      this.cachedIdentity.next(this.mapUserToIdentity(user));
      this.authReady.next(true);
    });
  }

  private mapUserToIdentity(user: User | null): Identity | null {
    if (!user) return null;

    // Normalize the Firebase user into the smaller shape used by the app.
    return {
      email: user.email ?? '',
      given_name: user.displayName?.split(' ')[0] ?? '',
      picture: user.photoURL ?? '',
      name: user.displayName ?? user.email ?? ''
    };
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await this.signInWithProvider(provider);
  }

  async loginWithGithub(): Promise<void> {
    const provider = new GithubAuthProvider();

    // Ask GitHub for basic profile data and email addresses.
    provider.addScope('read:user');
    provider.addScope('user:email');

    await this.signInWithProvider(provider);
  }

  private async signInWithProvider(
    provider: GoogleAuthProvider | GithubAuthProvider
  ): Promise<void> {
    try {
      // Normal popup sign-in flow for the selected OAuth provider.
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Special handling for "same email, different provider" collisions.
      await this.handleAccountExistsWithDifferentCredential(error);
    }
  }

  private async handleAccountExistsWithDifferentCredential(error: unknown): Promise<void> {
    const firebaseError = error as FirebaseError & {
      code?: string;
      customData?: { email?: string };
      email?: string;
      credential?: AuthCredential | null;
    };

    // Re-throw anything that is not the provider-linking case we expect here.
    if (firebaseError.code !== 'auth/account-exists-with-different-credential') {
      throw error;
    }

    // Firebase usually exposes the conflicting email here.
    const email =
      firebaseError.customData?.email ??
      firebaseError.email;

    // Recover the credential from the failed sign-in attempt
    // so we can link it after signing in with the existing provider.
    const pendingCredential = this.extractPendingCredential(firebaseError);

    if (!email || !pendingCredential) {
      throw error;
    }

    // Ask Firebase which provider already owns this email.
    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (!methods.length) {
      throw error;
    }

    // Usually the first method is the main one to continue with.
    const existingMethod = methods[0];

    if (existingMethod === 'google.com') {
      // Sign in with the existing Google account first...
      const result = await signInWithPopup(auth, new GoogleAuthProvider());

      // ...then link the original pending credential to the same Firebase user.
      await linkWithCredential(result.user, pendingCredential);
      return;
    }

    if (existingMethod === 'github.com') {
      const githubProvider = new GithubAuthProvider();
      githubProvider.addScope('read:user');
      githubProvider.addScope('user:email');

      // Sign in with the existing GitHub account first...
      const result = await signInWithPopup(auth, githubProvider);

      // ...then attach the pending provider credential to that account.
      await linkWithCredential(result.user, pendingCredential);
      return;
    }

    throw new Error(`Unsupported existing sign-in method for ${email}: ${existingMethod}`);
  }

  private extractPendingCredential(
    error: FirebaseError
  ): AuthCredential | null {
    // Try each provider helper because the failed popup could have come
    // from either Google or GitHub.
    return (
      GoogleAuthProvider.credentialFromError(error) ??
      GithubAuthProvider.credentialFromError(error) ??
      null
    );
  }

  getGivenName(): Observable<string | undefined> {
    return this.cachedIdentity.pipe(map(identity => identity?.given_name));
  }

  getAvatar(): Observable<string | undefined> {
    return this.cachedIdentity.pipe(map(identity => identity?.picture));
  }

  getName(): Observable<string | undefined> {
    return this.cachedIdentity.pipe(map(identity => identity?.name));
  }

  getEmail(): Observable<string | undefined> {
    return this.cachedIdentity.pipe(map(identity => identity?.email));
  }

  isIdentityCached(): Observable<boolean> {
    return this.cachedIdentity.pipe(map(identity => !!identity));
  }

  isAuthReady(): Observable<boolean> {
    return this.authReady.asObservable();
  }

  async loggedInPromise(): Promise<boolean> {
    return new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(Boolean(user));
      });
    });
  }

  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;

    // Firebase returns the cached token or refreshes it automatically if needed.
    return user.getIdToken();
  }

  logout(): Promise<void> {
    // Clear local UI state immediately, then sign out from Firebase.
    this.cachedIdentity.next(null);
    return signOut(auth);
  }
}