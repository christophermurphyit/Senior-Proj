import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent {
  email = '';
  username = '';
  password = '';
  favoriteLocation = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  isValidating = false; // Add this property to track validation state

  onSubmit() {
    if (!this.email || !this.username || !this.password || !this.favoriteLocation) {
      this.message = "All fields are required.";
      return;
    }
  
    // Email validation
    if (!this.email.includes('@')) {
      this.message = "Please enter a valid email address.";
      return;
    }
  
    // Password validation
    const passwordRegex = /^(?=.*\d).{6,}$/; // At least 6 characters and at least one number
    if (!passwordRegex.test(this.password)) {
      this.message = "Please enter a Password with at least 6 characters including at least one number.";
      return;
    }
  
    this.isValidating = true; // Set loading state
    this.validateLocation(this.favoriteLocation).subscribe({
      next: (isValid) => {
        this.isValidating = false; // Reset loading state
        if (!isValid) {
          this.message = "Invalid favorite location. Please enter a valid location.";
          return;
        }
  
        // Continue with account creation
        this.createAccount();
      },
      error: () => {
        this.isValidating = false; // Reset loading state
        this.message = "Error validating location. Please try again.";
      }
    });
  }

private createAccount() {
    this.http.post('/api/createAccount', {
      email: this.email,
      username: this.username,
      password: this.password,
      favoriteLocation: this.favoriteLocation
    }).subscribe({
     next: (response: any) => {
      alert(response.message);
      this.router.navigate(['/home']);
      },
      error: (error) => {
        if (error.status === 409) {
          this.message = "Username or email already exists.";
     } else {
        this.message = "An error occurred. Please try again.";
      }
    }
  });
}


  checkUserExists() {
    this.http.post(
      '/api/checkUserExists',
      {
        email: this.email,
        username: this.username,
        password: this.password,
        favoriteLocation: this.favoriteLocation
      },
      { responseType: 'json' }
    ).subscribe({
      next: (response: any) => {
        if (response.exists) {
          alert("Account created successfully! Redirecting to the homepage...");
          this.router.navigate(['/home']); // Redirect to the homepage
        } else {
          console.error("Unexpected error: User not found after account creation.");
          this.message = "An unexpected error occurred. Please try again.";
        }
     },
      error: (error) => {
        console.error("Error during user verification:", error);
        this.message = "An error occurred while verifying the account. Please try again.";
      }
    });
  }
  goHome() {
  this.router.navigate(['/home']);
  }
  

  validateLocation(location: string) {
    const url = `/api/weather?city=${encodeURIComponent(location)}`;
    return this.http.get(url).pipe(
      map((response: any) => !!response.weather),  // Valid if 'weather' data exists
      catchError(() => of(false))
    );
  }  
}
