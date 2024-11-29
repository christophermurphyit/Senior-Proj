import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUser: string | null = null;

  constructor() {
    // Check if user is already logged in on initialization
    const user = localStorage.getItem('loggedInUser');
    if (user) {
      this.currentUser = user;
      this.isLoggedInSubject.next(true);
    }
  }

  login(user: string) {
    this.currentUser = user;
    this.isLoggedInSubject.next(true);
    localStorage.setItem('loggedInUser', user);
  }

  logout() {
    this.currentUser = null;
    this.isLoggedInSubject.next(false);
    localStorage.removeItem('loggedInUser');
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): string | null {
    if (!this.currentUser) {
      this.currentUser = localStorage.getItem('loggedInUser');
    }
    return this.currentUser;
  }
}