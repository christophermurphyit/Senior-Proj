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
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      this.currentUser = user;
      this.isLoggedInSubject.next(true);
    }
  }

  login(username: string, token: string) {
    this.currentUser = username;
    this.isLoggedInSubject.next(true);
    sessionStorage.setItem('loggedInUser', username);
    localStorage.setItem('token', token);
  }

  logout() {
    this.currentUser = null;
    this.isLoggedInSubject.next(false);
    sessionStorage.removeItem('loggedInUser');
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): string | null {
    if (!this.currentUser) {
      this.currentUser = sessionStorage.getItem('loggedInUser');
    }
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
