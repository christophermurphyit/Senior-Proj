import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  usernameOrEmail = '';
  password = '';
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    if (!this.usernameOrEmail || !this.password) {
      this.message = "Username/Email and password are required.";
      return;
    }

    // Send login data to the backend
    this.http.post('http://localhost:5001/login', {
      usernameOrEmail: this.usernameOrEmail,
      password: this.password
    }, { responseType: 'text' }).subscribe({
      next: (response: string) => {
        console.log(response); // Log the response for debugging
        if (response === "Login successful") { // Check the text response
          this.message = "Login successful!";
          this.router.navigate(['/home']); // Redirect on success
        } else {
          this.message = "Invalid username or password.";
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.message = "Invalid username/email or password.";
        } else {
          this.message = "An error occurred. Please try again.";
        }
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
