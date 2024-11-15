import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  login() {
    this.isLoggedInSubject.next(true); // Notify subscribers that user is logged in
  }

  logout() {
    this.isLoggedInSubject.next(false); // Notify subscribers that user is logged out
  }

  isAuthenticated() {
    return this.isLoggedInSubject.value; // Get current authentication state
  }
}
