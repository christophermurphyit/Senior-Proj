// account-info.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css'],
})
export class AccountInfoComponent implements OnInit {
  // Current user info, loaded from the server
  currentEmail = '';
  currentUsername = '';
  currentFavoriteLocation = '';

  // Fields for editing
  newEmail = '';
  newUsername = '';
  newFavoriteLocation = '';
  newPassword = '';
  confirmNewPassword = '';

  // Current password required for verification
  currentPassword = '';

  // UI states
  isEditing = false;
  isSubmitting = false;
  message = '';

  // The usernameOrEmail that identifies the logged-in user
  currentUsernameOrEmail: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 1. Make sure user is logged in
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      // Not logged in? redirect to /login
      this.router.navigate(['/login']);
      return;
    }

    this.currentUsernameOrEmail = currentUser;

    // 2. Fetch current info
    this.http
      .get(`/api/getAccountInfo`)
      .subscribe({
        next: (response: any) => {
          this.currentEmail = response.email;
          this.currentUsername = response.username;
          this.currentFavoriteLocation = response.favoriteLocation;
        },
        error: (error) => {
          console.error('Error fetching account info:', error);
          this.message = 'Unable to load account info.';
        },
      });
  }

  // Toggles edit mode on/off
  toggleEdit() {
    this.isEditing = true;
    // Pre-fill from existing data
    this.newEmail = this.currentEmail;
    this.newUsername = this.currentUsername;
    this.newFavoriteLocation = this.currentFavoriteLocation;

    this.newPassword = '';
    this.confirmNewPassword = '';
    this.currentPassword = '';
  }

  // Cancel button
  cancelEdit() {
    this.isEditing = false;
    this.message = '';

    // Re-sync fields
    this.newEmail = this.currentEmail;
    this.newUsername = this.currentUsername;
    this.newFavoriteLocation = this.currentFavoriteLocation;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.currentPassword = '';
  }

  // Validate location (like create.component)
  private validateLocation(location: string) {
    const url = `/api/weather?city=${encodeURIComponent(location)}`;
    return this.http.get(url).pipe(
      map((response: any) => !!response.weather),
      catchError(() => of(false)) // If error, invalid city
    );
  }  

  onSubmit() {
    // 1. Confirm user wants to proceed
    const isSure = confirm('Are you sure you want to update your account information?');
    if (!isSure) return;

    // 2. Validate new password (if provided)
    if (this.newPassword || this.confirmNewPassword) {
      if (this.newPassword !== this.confirmNewPassword) {
        this.message = 'New password and confirmation do not match.';
        return;
      }
      // If they typed a new password, must meet your create rules
      const passwordRegex = /^(?=.*\d).{6,}$/; 
      if (this.newPassword && !passwordRegex.test(this.newPassword)) {
        this.message = 'Please enter a Password with at least 6 characters including at least one number.';
        return;
      }
    }

    // 3. Validate new email if user changed it
    const changedEmail = this.newEmail.trim();
    if (changedEmail && changedEmail !== this.currentEmail && !changedEmail.includes('@')) {
      this.message = 'Please enter a valid email address.';
      return;
    }

    // 4. Check current password
    if (!this.currentPassword.trim()) {
      this.message = 'Please enter your current password.';
      return;
    }

    // 5. Validate new favorite location if changed
    const newLoc = this.newFavoriteLocation.trim();
    if (newLoc && newLoc !== this.currentFavoriteLocation) {
      this.isSubmitting = true;
      this.validateLocation(newLoc).subscribe({
        next: (isValid: boolean) => {
          this.isSubmitting = false;
          if (!isValid) {
            this.message = 'Invalid favorite location. Please enter a valid location.';
            return;
          }
          // Valid location => proceed
          this.submitUpdate();
        },
        error: () => {
          this.isSubmitting = false;
          this.message = 'Error validating location. Please try again.';
        },
      });
    } else {
      // If location unchanged or empty, skip location validation
      this.submitUpdate();
    }
  }

  private submitUpdate(): void {
    this.isSubmitting = true;
    this.http
      .put('/api/updateAccount', {
        currentUsernameOrEmail: this.currentUsernameOrEmail,
        newEmail: this.newEmail.trim() || '',
        newUsername: this.newUsername.trim() || '',
        newFavoriteLocation: this.newFavoriteLocation.trim() || '',
        newPassword: this.newPassword.trim() || '',
        currentPassword: this.currentPassword.trim(),
      })
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          alert(response.message); // e.g. "Account updated successfully!"

          // Clear out password fields
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.currentPassword = '';

          // Optionally logout & go home
          this.authService.logout();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.status === 401) {
            this.message = 'Invalid current password. Please try again.';
            return;
          }
          if (error.error && error.error.message) {
            this.message = error.error.message;
          } else {
            this.message = 'An error occurred. Please try again.';
          }
        },
      });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}