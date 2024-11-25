import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';





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

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onLogin() {
    if (!this.usernameOrEmail || !this.password) {
      this.message = 'Username/Email and password are required.';
      return;
    }
  
    // Send login data to the backend
    this.http.post(
      'http://localhost:5001/login',
      {
        usernameOrEmail: this.usernameOrEmail,
        password: this.password,
      },
      { responseType: 'text' }
    ).subscribe({
      next: (response: string) => {
        if (response === 'Login successful') {
          alert('Login Successful!');
          this.message = 'Login successful!';
          this.authService.login(this.usernameOrEmail); // Pass the username/email to AuthService
          this.router.navigate(['/home']); // Redirect to homepage
        } else {
          this.message = 'Invalid username or password.';
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.message = 'Invalid username/email or password.';
        } else {
          this.message = "Username or Password is Incorrect. Please try again.";
        }
      },
    });
  }
  
  

  goHome() {
    this.router.navigate(['/home']);
  }
}
