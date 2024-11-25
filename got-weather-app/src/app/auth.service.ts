import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUser: string | null = null; // Track the current user

  login(user: string) {
    this.currentUser = user; // Set the logged-in user
    this.isLoggedInSubject.next(true); // Notify subscribers that user is logged in
    localStorage.setItem('loggedInUser', user); // Persist user session
  }

  logout() {
    this.currentUser = null; // Clear the logged-in user
    this.isLoggedInSubject.next(false); // Notify subscribers that user is logged out
    localStorage.removeItem('loggedInUser'); // Clear session
  }

  isAuthenticated() {
    return this.isLoggedInSubject.value; // Get current authentication state
  }

  getCurrentUser(): string | null {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('loggedInUser'); // Retrieve from storage
    }
    return this.currentUser;
  }
}
