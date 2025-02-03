import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

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
      // Not logged in? Send them to login.
      this.router.navigate(['/login']);
      return;
    }

    this.currentUsernameOrEmail = currentUser;

    // 2. Fetch the current info from the server
    this.http
      .get(`http://localhost:5001/getAccountInfo?usernameOrEmail=${currentUser}`)
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

    // Pre-fill the "edit" fields with the current info
    this.newEmail = this.currentEmail;
    this.newUsername = this.currentUsername;
    this.newFavoriteLocation = this.currentFavoriteLocation;

    // Clear out any old password entries
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  // If user clicks "Cancel", just revert to view mode
  cancelEdit() {
    this.isEditing = false;
    this.message = '';

    // Optionally, re-sync the newX fields to current info
    // or just let them remain (they won't matter once we hide them)
    this.newEmail = this.currentEmail;
    this.newUsername = this.currentUsername;
    this.newFavoriteLocation = this.currentFavoriteLocation;
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  onSubmit() {
    // 1. Confirm user wants to proceed
    const isSure = confirm(
      'Are you sure you want to update your account information?'
    );
    if (!isSure) {
      return;
    }

    // 2. If a new password is provided, verify confirmNewPassword
    if (this.newPassword || this.confirmNewPassword) {
      if (this.newPassword !== this.confirmNewPassword) {
        this.message = 'New password and confirmation do not match.';
        return;
      }
    }

    // 3. Prompt for current password
    const currentPassword = prompt('Please enter your *current* password:');
    if (!currentPassword) {
      this.message = 'Update canceled. No current password provided.';
      return;
    }

    // 4. Send update request to server
    this.isSubmitting = true;
    this.http
      .put('http://localhost:5001/updateAccount', {
        currentUsernameOrEmail: this.currentUsernameOrEmail,
        newEmail: this.newEmail.trim() || '',
        newUsername: this.newUsername.trim() || '',
        newFavoriteLocation: this.newFavoriteLocation.trim() || '',
        newPassword: this.newPassword.trim() || '',
        currentPassword: currentPassword.trim(),
      })
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          alert(response.message); // "Account updated successfully!"
          // Update our "current" info after success:
          this.currentEmail = this.newEmail;
          this.currentUsername = this.newUsername;
          this.currentFavoriteLocation = this.newFavoriteLocation;

          // Turn off edit mode
          this.isEditing = false;

          // Clear the new password fields
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.message = '';
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.error && error.error.message) {
            this.message = error.error.message;
          } else {
            this.message = 'An error occurred. Please try again.';
          }
        },
      });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}