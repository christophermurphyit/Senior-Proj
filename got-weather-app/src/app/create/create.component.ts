import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule],
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

  onSubmit() {
    console.log("Preparing to send request:", this.email, this.username, this.password, this.favoriteLocation);
  
    if (!this.email || !this.username || !this.password || !this.favoriteLocation) {
      this.message = "All fields are required.";
      return;
    }
  
    // Validate location first
    this.validateLocation(this.favoriteLocation).subscribe({
      next: (isValid) => {
        if (!isValid) {
          this.message = "Invalid favorite location. Please enter a valid location.";
          return;
        }
        
        // Send account data to the backend
        this.http.post('http://localhost:5001/createAccount', {
          email: this.email,
          username: this.username,
          password: this.password,
          favoriteLocation: this.favoriteLocation
        }, { responseType: 'text' }).subscribe({
          next: (response) => {
            console.log("Account creation response:", response);
            this.message = "Account created successfully!";
            this.router.navigate(['/home']); // Redirect to home on success
          },
          error: (error) => {
            if (error.status === 409) {
              this.message = "Username or email already exists.";
            } else {
              this.message = "An error occurred. Please try again.";
            }
          }
        });
      },
      error: () => {
        this.message = "Error validating location. Please try again.";
      }
    });
  }
  
  
  
  

  validateLocation(location: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=d474509725247f01f4f5b322d067dd8b&units=imperial`;
    return this.http.get(url).pipe(
      map((response: any) => !!response.weather),  // Valid if 'weather' data exists
      catchError(() => of(false))
    );
  }
}
